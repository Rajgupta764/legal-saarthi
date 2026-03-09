"""
User Activity Service – Tracks per-user progress, documents, and analytics.
"""

from datetime import datetime
from bson.objectid import ObjectId
from app.config.mongodb import get_db


class UserActivityService:
    """Track and retrieve user-specific activity data."""

    # ── Points config ──
    POINTS = {
        "chat": 5,
        "voice_chat": 5,
        "document_upload": 15,
        "document_check": 10,
        "draft_generated": 20,
        "tip_read": 3,
        "scheme_check": 5,
    }

    LEVELS = [
        (0, "नया सदस्य"),
        (100, "सीखने वाला"),
        (500, "जागरूक नागरिक"),
        (1500, "कानून सहायक"),
        (3500, "कानून विशेषज्ञ"),
        (7000, "महान वकील"),
    ]

    # ── Record an activity ──
    @staticmethod
    def record_activity(user_email, activity_type, details=None):
        """Record a user activity and award points."""
        db = get_db()
        if db is None:
            return

        points = UserActivityService.POINTS.get(activity_type, 0)

        # Insert activity log
        db["user_activities"].insert_one({
            "email": user_email,
            "type": activity_type,
            "points": points,
            "details": details or {},
            "created_at": datetime.utcnow(),
        })

        # Upsert user stats counters
        update = {
            "$inc": {
                "total_points": points,
                f"counts.{activity_type}": 1,
            },
            "$set": {"updated_at": datetime.utcnow()},
            "$setOnInsert": {
                "email": user_email,
                "created_at": datetime.utcnow(),
            },
        }
        db["user_stats"].update_one({"email": user_email}, update, upsert=True)

    # ── Get user progress ──
    @staticmethod
    def get_progress(user_email):
        """Get progress data for the logged-in user."""
        db = get_db()
        if db is None:
            return UserActivityService._empty_progress()

        stats = db["user_stats"].find_one({"email": user_email})

        user = db["users"].find_one({"email": user_email})
        name = user.get("name", "User") if user else "User"

        if not stats:
            result = UserActivityService._empty_progress()
            result["name"] = name
            return result

        total_points = stats.get("total_points", 0)
        counts = stats.get("counts", {})

        level, level_name, next_level = UserActivityService._compute_level(total_points)

        # Recent activities (last 10)
        recent = list(
            db["user_activities"]
            .find({"email": user_email})
            .sort("created_at", -1)
            .limit(10)
        )
        for r in recent:
            r["_id"] = str(r["_id"])
            r["created_at"] = r["created_at"].isoformat() if r.get("created_at") else None

        return {
            "name": name,
            "level": level,
            "level_name": level_name,
            "points": total_points,
            "next_level_points": next_level,
            "chats": counts.get("chat", 0) + counts.get("voice_chat", 0),
            "documents_uploaded": counts.get("document_upload", 0) + counts.get("document_check", 0),
            "drafts_generated": counts.get("draft_generated", 0),
            "tips_read": counts.get("tip_read", 0),
            "schemes_checked": counts.get("scheme_check", 0),
            "recent_activities": recent,
        }

    # ── Get user documents ──
    @staticmethod
    def get_documents(user_email):
        """Get all documents for the logged-in user (excluding file_data for listing)."""
        db = get_db()
        if db is None:
            return []

        docs = list(
            db["user_documents"]
            .find({"email": user_email}, {"file_data": 0})
            .sort("created_at", -1)
        )
        for d in docs:
            d["_id"] = str(d["_id"])
            d["created_at"] = d["created_at"].isoformat() if d.get("created_at") else None
        return docs

    @staticmethod
    def save_document(user_email, doc_name, doc_type, content=None, size=None,
                      source="manual", file_data=None, file_mime=None, ai_summary=None):
        """Save a document record with optional file data."""
        db = get_db()
        if db is None:
            return None

        doc = {
            "email": user_email,
            "name": doc_name,
            "type": doc_type,
            "source": source,
            "status": "Saved",
            "size": size or "—",
            "content": content,
            "created_at": datetime.utcnow(),
        }
        if file_data:
            doc["file_data"] = file_data
            doc["file_mime"] = file_mime
        if ai_summary:
            doc["ai_summary"] = ai_summary

        result = db["user_documents"].insert_one(doc)
        UserActivityService.record_activity(user_email, "document_upload", {"name": doc_name})
        return str(result.inserted_id)

    @staticmethod
    def get_document_by_id(user_email, doc_id):
        """Get a single document including file_data."""
        db = get_db()
        if db is None:
            return None
        try:
            doc = db["user_documents"].find_one({
                "_id": ObjectId(doc_id),
                "email": user_email,
            })
            if doc:
                doc["_id"] = str(doc["_id"])
                doc["created_at"] = doc["created_at"].isoformat() if doc.get("created_at") else None
            return doc
        except Exception:
            return None

    @staticmethod
    def delete_document(user_email, doc_id):
        """Delete a user's document."""
        db = get_db()
        if db is None:
            return False
        result = db["user_documents"].delete_one({
            "_id": ObjectId(doc_id),
            "email": user_email,
        })
        return result.deleted_count > 0

    # ── Document Checklists ──
    CHECKLISTS = {
        "property_dispute": {
            "title": "भूमि/संपत्ति विवाद",
            "title_en": "Property Dispute",
            "docs": [
                {"name": "खसरा/खतौनी (भू-अभिलेख)", "name_en": "Land Revenue Record (Khasra/Khatauni)", "critical": True},
                {"name": "रजिस्ट्री / बैनामा", "name_en": "Sale Deed / Registry", "critical": True},
                {"name": "म्यूटेशन रिकॉर्ड (नामांतरण)", "name_en": "Mutation Record", "critical": True},
                {"name": "नक्शा / साइट प्लान", "name_en": "Map / Site Plan", "critical": False},
                {"name": "टैक्स रसीद / राजस्व रसीद", "name_en": "Tax Receipt", "critical": False},
                {"name": "वंशावली / उत्तराधिकार प्रमाण", "name_en": "Family Tree / Succession Certificate", "critical": False},
                {"name": "आधार कार्ड", "name_en": "Aadhaar Card", "critical": True},
                {"name": "गवाहों की सूची", "name_en": "Witness List", "critical": False},
            ],
        },
        "domestic_violence": {
            "title": "घरेलू हिंसा",
            "title_en": "Domestic Violence",
            "docs": [
                {"name": "FIR की कॉपी", "name_en": "FIR Copy", "critical": True},
                {"name": "मेडिकल रिपोर्ट / MLR", "name_en": "Medical Report / MLR", "critical": True},
                {"name": "शादी का प्रमाण पत्र", "name_en": "Marriage Certificate", "critical": True},
                {"name": "घर की तस्वीरें (चोट / नुकसान)", "name_en": "Photos of injuries/damage", "critical": False},
                {"name": "गवाहों का बयान", "name_en": "Witness statements", "critical": False},
                {"name": "आधार कार्ड", "name_en": "Aadhaar Card", "critical": True},
                {"name": "बैंक खाता विवरण", "name_en": "Bank Account Details", "critical": False},
            ],
        },
        "employment": {
            "title": "रोज़गार / मज़दूरी विवाद",
            "title_en": "Employment / Wage Dispute",
            "docs": [
                {"name": "नियुक्ति पत्र / ऑफर लेटर", "name_en": "Appointment Letter", "critical": True},
                {"name": "वेतन पर्ची / सैलरी स्लिप", "name_en": "Salary Slip", "critical": True},
                {"name": "MGNREGA जॉब कार्ड", "name_en": "MGNREGA Job Card", "critical": False},
                {"name": "बैंक स्टेटमेंट (वेतन भुगतान)", "name_en": "Bank Statement (salary credits)", "critical": False},
                {"name": "कार्य का फोटो / वीडियो प्रमाण", "name_en": "Photo/Video evidence of work", "critical": False},
                {"name": "आधार कार्ड", "name_en": "Aadhaar Card", "critical": True},
            ],
        },
        "fir_complaint": {
            "title": "FIR / पुलिस शिकायत",
            "title_en": "FIR / Police Complaint",
            "docs": [
                {"name": "शिकायत पत्र", "name_en": "Written Complaint", "critical": True},
                {"name": "घटना का विवरण (तारीख, समय, जगह)", "name_en": "Incident Details (date, time, place)", "critical": True},
                {"name": "गवाहों की जानकारी", "name_en": "Witness Information", "critical": False},
                {"name": "फोटो / वीडियो प्रमाण", "name_en": "Photo / Video Evidence", "critical": False},
                {"name": "मेडिकल रिपोर्ट (अगर चोट लगी)", "name_en": "Medical Report (if injured)", "critical": False},
                {"name": "आधार कार्ड", "name_en": "Aadhaar Card", "critical": True},
            ],
        },
        "consumer_complaint": {
            "title": "उपभोक्ता शिकायत",
            "title_en": "Consumer Complaint",
            "docs": [
                {"name": "खरीद बिल / रसीद", "name_en": "Purchase Bill / Receipt", "critical": True},
                {"name": "वारंटी / गारंटी कार्ड", "name_en": "Warranty / Guarantee Card", "critical": False},
                {"name": "खराब सामान की तस्वीर", "name_en": "Photo of defective product", "critical": False},
                {"name": "दुकानदार से बातचीत का प्रमाण", "name_en": "Communication with seller", "critical": False},
                {"name": "आधार कार्ड", "name_en": "Aadhaar Card", "critical": True},
            ],
        },
        "rti": {
            "title": "सूचना का अधिकार (RTI)",
            "title_en": "Right to Information (RTI)",
            "docs": [
                {"name": "RTI आवेदन की कॉपी", "name_en": "RTI Application Copy", "critical": True},
                {"name": "रसीद / ट्रैकिंग नंबर", "name_en": "Receipt / Tracking Number", "critical": True},
                {"name": "पोस्टल रसीद (अगर डाक से भेजा)", "name_en": "Postal Receipt (if sent by post)", "critical": False},
                {"name": "आधार कार्ड", "name_en": "Aadhaar Card", "critical": True},
            ],
        },
        "family_dispute": {
            "title": "पारिवारिक विवाद / तलाक",
            "title_en": "Family Dispute / Divorce",
            "docs": [
                {"name": "शादी का प्रमाण पत्र", "name_en": "Marriage Certificate", "critical": True},
                {"name": "बच्चों का जन्म प्रमाण पत्र", "name_en": "Children's Birth Certificate", "critical": False},
                {"name": "आय प्रमाण (दोनों पक्ष)", "name_en": "Income Proof (both parties)", "critical": True},
                {"name": "संपत्ति के दस्तावेज़", "name_en": "Property Documents", "critical": False},
                {"name": "शादी की तस्वीरें", "name_en": "Marriage Photos", "critical": False},
                {"name": "आधार कार्ड", "name_en": "Aadhaar Card", "critical": True},
            ],
        },
    }

    @staticmethod
    def get_checklist(issue_type):
        """Return document checklist for a specific legal issue type."""
        return UserActivityService.CHECKLISTS.get(issue_type)

    # ── Get user analytics ──
    @staticmethod
    def get_analytics(user_email):
        """Get personal analytics for the logged-in user."""
        db = get_db()
        if db is None:
            return UserActivityService._empty_analytics()

        stats = db["user_stats"].find_one({"email": user_email})
        if not stats:
            return UserActivityService._empty_analytics()

        counts = stats.get("counts", {})

        total_actions = sum(counts.values())
        chats = counts.get("chat", 0) + counts.get("voice_chat", 0)
        documents = counts.get("document_upload", 0) + counts.get("document_check", 0)
        drafts = counts.get("draft_generated", 0)
        tips = counts.get("tip_read", 0)
        schemes = counts.get("scheme_check", 0)

        # Monthly breakdown from activity log (last 6 months)
        from datetime import timedelta
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        pipeline = [
            {"$match": {"email": user_email, "created_at": {"$gte": six_months_ago}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m", "date": "$created_at"}},
                "count": {"$sum": 1},
                "points": {"$sum": "$points"},
            }},
            {"$sort": {"_id": 1}},
        ]
        monthly = list(db["user_activities"].aggregate(pipeline))

        return {
            "total_actions": total_actions,
            "total_points": stats.get("total_points", 0),
            "chats": chats,
            "documents": documents,
            "drafts": drafts,
            "tips_read": tips,
            "schemes_checked": schemes,
            "monthly": monthly,
        }

    # ── Helpers ──
    @staticmethod
    def _compute_level(points):
        level = 1
        level_name = "नया सदस्य"
        next_level = 100
        for i, (threshold, name) in enumerate(UserActivityService.LEVELS):
            if points >= threshold:
                level = i + 1
                level_name = name
                if i + 1 < len(UserActivityService.LEVELS):
                    next_level = UserActivityService.LEVELS[i + 1][0]
                else:
                    next_level = threshold + 5000
        return level, level_name, next_level

    @staticmethod
    def _empty_progress():
        return {
            "name": "User",
            "level": 1,
            "level_name": "नया सदस्य",
            "points": 0,
            "next_level_points": 100,
            "chats": 0,
            "documents_uploaded": 0,
            "drafts_generated": 0,
            "tips_read": 0,
            "schemes_checked": 0,
            "recent_activities": [],
        }

    @staticmethod
    def _empty_analytics():
        return {
            "total_actions": 0,
            "total_points": 0,
            "chats": 0,
            "documents": 0,
            "drafts": 0,
            "tips_read": 0,
            "schemes_checked": 0,
            "monthly": [],
        }
