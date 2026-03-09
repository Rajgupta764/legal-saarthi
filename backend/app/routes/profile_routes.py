"""
User Profile Routes – Progress, Documents, Analytics for the logged-in user.
"""

import base64
from flask import Blueprint, request, jsonify, Response
from app.services.auth_service import AuthService
from app.services.user_activity_service import UserActivityService

profile_bp = Blueprint("profile", __name__)

ALLOWED_MIMES = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _get_user_email():
    """Extract user email from JWT token in Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    result = AuthService.verify_token(token)
    if result["success"]:
        return result["data"].get("email")
    return None


# ── Progress ──
@profile_bp.route("/profile/progress", methods=["GET"])
def get_progress():
    email = _get_user_email()
    if not email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    data = UserActivityService.get_progress(email)
    return jsonify({"success": True, "data": data}), 200


# ── Documents ──
@profile_bp.route("/profile/documents", methods=["GET"])
def get_documents():
    email = _get_user_email()
    if not email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    docs = UserActivityService.get_documents(email)
    return jsonify({"success": True, "data": docs}), 200


@profile_bp.route("/profile/documents", methods=["POST"])
def save_document():
    email = _get_user_email()
    if not email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    data = request.get_json()
    doc_id = UserActivityService.save_document(
        email,
        data.get("name", "Untitled"),
        data.get("type", "Document"),
        data.get("content"),
        data.get("size"),
        source=data.get("source", "manual"),
    )
    if doc_id:
        return jsonify({"success": True, "data": {"id": doc_id}}), 201
    return jsonify({"success": False, "error": "Failed to save"}), 500


@profile_bp.route("/profile/documents/upload", methods=["POST"])
def upload_document():
    """Upload a file (image/PDF) and store it with metadata."""
    email = _get_user_email()
    if not email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"success": False, "error": "कोई फाइल नहीं मिली"}), 400

    if file.mimetype not in ALLOWED_MIMES:
        return jsonify({"success": False, "error": "केवल JPG, PNG या PDF फाइल अपलोड करें"}), 400

    file_bytes = file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        return jsonify({"success": False, "error": "फाइल 10MB से बड़ी है"}), 400

    file_b64 = base64.b64encode(file_bytes).decode("utf-8")
    doc_name = request.form.get("name", file.filename)
    doc_type = request.form.get("type", "Document")

    size_kb = len(file_bytes) / 1024
    size_str = f"{size_kb:.0f} KB" if size_kb < 1024 else f"{size_kb / 1024:.1f} MB"

    doc_id = UserActivityService.save_document(
        email, doc_name, doc_type,
        size=size_str,
        source="upload",
        file_data=file_b64,
        file_mime=file.mimetype,
    )
    if doc_id:
        return jsonify({"success": True, "data": {"id": doc_id, "name": doc_name, "size": size_str}}), 201
    return jsonify({"success": False, "error": "सेव नहीं हो पाया"}), 500


@profile_bp.route("/profile/documents/<doc_id>/download", methods=["GET"])
def download_document(doc_id):
    """Download (serve) a stored file."""
    email = _get_user_email()
    if not email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    doc = UserActivityService.get_document_by_id(email, doc_id)
    if not doc or not doc.get("file_data"):
        return jsonify({"success": False, "error": "File not found"}), 404

    file_bytes = base64.b64decode(doc["file_data"])
    mime = doc.get("file_mime", "application/octet-stream")
    filename = doc.get("name", "document")

    return Response(
        file_bytes,
        mimetype=mime,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@profile_bp.route("/profile/documents/<doc_id>/analyze", methods=["POST"])
def analyze_document(doc_id):
    """AI-analyze a stored document – extract text via OCR then explain in simple Hindi."""
    email = _get_user_email()
    if not email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    doc = UserActivityService.get_document_by_id(email, doc_id)
    if not doc:
        return jsonify({"success": False, "error": "Document not found"}), 404

    from app.services.ai_chat_service import AIChatService
    ai = AIChatService()
    if not ai.is_available:
        return jsonify({"success": False, "error": "AI service unavailable"}), 503

    # Step 1: Get document text content
    content_for_ai = ""

    # If we already have text content (e.g. saved drafts)
    if doc.get("content") and len(doc["content"].strip()) > 20:
        content_for_ai = doc["content"][:4000]

    # If we have file_data, run OCR to extract text
    elif doc.get("file_data"):
        try:
            import io
            from werkzeug.datastructures import FileStorage
            from app.services.document_service import DocumentService

            file_bytes = base64.b64decode(doc["file_data"])
            mime = doc.get("file_mime", "application/octet-stream")
            fname = doc.get("name", "document")

            # Create a file-like object for OCR service
            file_stream = io.BytesIO(file_bytes)
            file_obj = FileStorage(stream=file_stream, filename=fname, content_type=mime)

            doc_service = DocumentService()
            ocr_result = doc_service._extract_text_ocr(file_obj)

            if ocr_result.get("success") and ocr_result.get("text", "").strip():
                extracted_text = ocr_result["text"]
                content_for_ai = extracted_text[:4000]

                # Save extracted text back to document for future use
                from app.config.mongodb import get_db as _get_db
                from bson.objectid import ObjectId as _ObjId
                _db = _get_db()
                if _db:
                    _db["user_documents"].update_one(
                        {"_id": _ObjId(doc_id), "email": email},
                        {"$set": {"content": extracted_text[:8000]}},
                    )
            else:
                content_for_ai = f"[OCR could not extract text. File: {fname}, Type: {doc.get('type', 'Unknown')}]"
        except Exception as ocr_err:
            content_for_ai = f"[File text extraction failed: {fname}. Type: {doc.get('type', 'Unknown')}]"

    if not content_for_ai:
        content_for_ai = f"Document name: {doc.get('name', 'Unknown')}, Type: {doc.get('type', 'Unknown')}"

    # Step 2: Send to AI for explanation
    analysis_prompt = f"""ये एक कानूनी दस्तावेज़ का विश्लेषण करो। दस्तावेज़ का नाम: "{doc.get('name', 'Unknown')}", प्रकार: "{doc.get('type', 'Unknown')}".

दस्तावेज़ की सामग्री:
{content_for_ai}

कृपया इसे बहुत सरल हिंदी में समझाओ:
1. ये दस्तावेज़ क्या है (2-3 लाइन में)
2. इसमें क्या-क्या महत्वपूर्ण बातें लिखी हैं
3. कोई ज़रूरी तारीख या अवधि हो तो बताओ
4. यूज़र को क्या करना चाहिए (कदम बताओ)
5. कोई ख़तरा या ध्यान रखने वाली बात"""

    try:
        result = ai.chat(analysis_prompt, conversation_history=[], language="hi")
        summary = result.get("reply", "विश्लेषण उपलब्ध नहीं")

        # Save analysis back to document
        from app.config.mongodb import get_db
        from bson.objectid import ObjectId
        db = get_db()
        if db:
            db["user_documents"].update_one(
                {"_id": ObjectId(doc_id), "email": email},
                {"$set": {"ai_summary": summary}},
            )

        UserActivityService.record_activity(email, "document_check", {"name": doc.get("name")})
        return jsonify({"success": True, "data": {"summary": summary}}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@profile_bp.route("/profile/documents/<doc_id>", methods=["DELETE"])
def delete_document(doc_id):
    email = _get_user_email()
    if not email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    deleted = UserActivityService.delete_document(email, doc_id)
    if deleted:
        return jsonify({"success": True}), 200
    return jsonify({"success": False, "error": "Not found"}), 404


# ── Checklists ──
@profile_bp.route("/profile/checklist/<issue_type>", methods=["GET"])
def get_checklist(issue_type):
    data = UserActivityService.get_checklist(issue_type)
    if not data:
        types = list(UserActivityService.CHECKLISTS.keys())
        return jsonify({"success": False, "error": "Invalid type", "available_types": types}), 404
    return jsonify({"success": True, "data": data}), 200


@profile_bp.route("/profile/checklists", methods=["GET"])
def list_checklists():
    """List all available checklist categories."""
    result = []
    for key, val in UserActivityService.CHECKLISTS.items():
        result.append({"id": key, "title": val["title"], "title_en": val["title_en"], "count": len(val["docs"])})
    return jsonify({"success": True, "data": result}), 200


# ── Analytics ──
@profile_bp.route("/profile/analytics", methods=["GET"])
def get_analytics():
    email = _get_user_email()
    if not email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    data = UserActivityService.get_analytics(email)
    return jsonify({"success": True, "data": data}), 200


# ── Record activity (called by other features) ──
@profile_bp.route("/profile/activity", methods=["POST"])
def record_activity():
    email = _get_user_email()
    if not email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    data = request.get_json()
    activity_type = data.get("type", "")
    details = data.get("details", {})
    UserActivityService.record_activity(email, activity_type, details)
    return jsonify({"success": True}), 200
