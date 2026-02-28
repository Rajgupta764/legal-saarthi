#!/usr/bin/env python
"""Quick test for Legal Education Service"""

from app.services.legal_education_service import LegalEducationService

service = LegalEducationService()

print("✅ Service initialized successfully")
topics = service.get_all_content()
print(f"✅ Loaded {len(topics)} topics")
print(f"Topics: {list(topics.keys())}")

# Test FIR topic
fir = service.get_content_by_topic('fir_information')
print(f"\n✅ FIR Topic loaded")
print(f"Title: {fir['title']}")
print(f"Sections: {len(fir['sections'])}")

# Test search
results = service.search_content('पुलिस')
print(f"\n✅ Search test - Found {len(results)} results for 'पुलिस'")

# Test another search
results = service.search_content('अधिकार')
print(f"✅ Search test - Found {len(results)} results for 'अधिकार'")

print("\n✅ All tests passed!")
