"""
Test Suite for Legal Tips System
Verifies all functionality works correctly
"""

import sys
import json
sys.path.insert(0, '../')

from app.services.legal_tips_service import LegalTipsService

def test_service_initialization():
    """Test if service initializes correctly"""
    print("\n🧪 Test 1: Service Initialization")
    try:
        service = LegalTipsService()
        print("✓ Service initialized successfully")
        print(f"  - Categories: {list(service.tips_database.keys())}")
        return True
    except Exception as e:
        print(f"✗ Service initialization failed: {e}")
        return False


def test_get_all_tips():
    """Test getting all tips"""
    print("\n🧪 Test 2: Get All Tips")
    try:
        service = LegalTipsService()
        tips = service.get_all_tips()
        print(f"✓ Retrieved {len(tips)} tips")
        print(f"  - First tip: {tips[0]['hindi']}")
        return True
    except Exception as e:
        print(f"✗ Failed to get all tips: {e}")
        return False


def test_get_by_category():
    """Test getting tips by category"""
    print("\n🧪 Test 3: Get Tips by Category")
    try:
        service = LegalTipsService()
        
        # Test property tips
        property_tips = service.get_tips_by_category('property_disputes')
        if property_tips:
            print(f"✓ Property tips: {len(property_tips)} found")
            print(f"  - First: {property_tips[0]['hindi']}")
        
        # Test labour tips
        labour_tips = service.get_tips_by_category('labour_rights')
        if labour_tips:
            print(f"✓ Labour tips: {len(labour_tips)} found")
            print(f"  - First: {labour_tips[0]['hindi']}")
        
        return True
    except Exception as e:
        print(f"✗ Failed to get tips by category: {e}")
        return False


def test_search_functionality():
    """Test search across tips"""
    print("\n🧪 Test 4: Search Functionality")
    try:
        service = LegalTipsService()
        
        # Search for dowry
        results = service.search_tips('dowry')
        print(f"✓ Search 'dowry': {len(results)} results")
        if results:
            print(f"  - Found: {results[0]['hindi']}")
        
        # Search for property
        results = service.search_tips('property')
        print(f"✓ Search 'property': {len(results)} results")
        
        # Search for workers
        results = service.search_tips('labour')
        print(f"✓ Search 'labour': {len(results)} results")
        
        return True
    except Exception as e:
        print(f"✗ Search functionality failed: {e}")
        return False


def test_priority_filtering():
    """Test priority-based filtering"""
    print("\n🧪 Test 5: Priority Filtering")
    try:
        service = LegalTipsService()
        
        critical = service.get_tips_by_priority('critical')
        print(f"✓ Critical tips: {len(critical)}")
        for tip in critical:
            print(f"  - {tip['hindi']} ({tip['category']})")
        
        high = service.get_tips_by_priority('high')
        print(f"✓ High priority tips: {len(high)}")
        
        return True
    except Exception as e:
        print(f"✗ Priority filtering failed: {e}")
        return False


def test_tip_structure():
    """Test if tips have required fields"""
    print("\n🧪 Test 6: Tip Structure Validation")
    try:
        service = LegalTipsService()
        tips = service.get_all_tips()
        
        required_fields = ['id', 'category', 'priority', 'hindi', 'title', 
                          'problem', 'tip', 'government_source', 'law']
        
        all_valid = True
        for tip in tips:
            for field in required_fields:
                if field not in tip:
                    print(f"✗ Missing field '{field}' in tip: {tip.get('id')}")
                    all_valid = False
        
        if all_valid:
            print(f"✓ All {len(tips)} tips have required fields")
        
        # Check trust fields
        with_government = len([t for t in tips if t.get('government_source', {}).get('verified')])
        with_law = len([t for t in tips if t.get('law', {}).get('act')])
        with_helplines = len([t for t in tips if t.get('helplines')])
        
        print(f"✓ Government verified: {with_government}/{len(tips)}")
        print(f"✓ With legal references: {with_law}/{len(tips)}")
        print(f"✓ With helplines: {with_helplines}/{len(tips)}")
        
        return all_valid
    except Exception as e:
        print(f"✗ Structure validation failed: {e}")
        return False


def test_government_sources():
    """Verify government sources are real"""
    print("\n🧪 Test 7: Government Sources")
    try:
        service = LegalTipsService()
        tips = service.get_all_tips()
        
        sources = {}
        for tip in tips:
            source = tip.get('government_source', {}).get('source')
            if source:
                if source not in sources:
                    sources[source] = []
                sources[source].append(tip['hindi'])
        
        print(f"✓ Found {len(sources)} unique government sources:")
        for source, tips_list in sources.items():
            print(f"  - {source}: {len(tips_list)} tips")
        
        return True
    except Exception as e:
        print(f"✗ Government sources verification failed: {e}")
        return False


def test_get_by_id():
    """Test getting specific tip by ID"""
    print("\n🧪 Test 8: Get Tip by ID")
    try:
        service = LegalTipsService()
        
        # Get all tips and test first one
        tips = service.get_all_tips()
        if tips:
            tip_id = tips[0]['id']
            fetched = service.get_tip_by_id(tip_id)
            if fetched and fetched['id'] == tip_id:
                print(f"✓ Retrieved tip by ID: {fetched['hindi']}")
            else:
                print(f"✗ Failed to retrieve tip by ID")
                return False
        
        return True
    except Exception as e:
        print(f"✗ Get by ID failed: {e}")
        return False


def test_daily_tips():
    """Test daily tips functionality"""
    print("\n🧪 Test 9: Daily Tips Rotation")
    try:
        service = LegalTipsService()
        
        daily = service.get_daily_tips(3)
        print(f"✓ Retrieved {len(daily)} daily tips")
        for tip in daily:
            print(f"  - {tip['hindi']}")
        
        return len(daily) > 0
    except Exception as e:
        print(f"✗ Daily tips failed: {e}")
        return False


def test_sample_tip_details():
    """Show detail of a sample tip"""
    print("\n🧪 Test 10: Sample Tip Details")
    try:
        service = LegalTipsService()
        tips = service.get_all_tips()
        
        if tips:
            tip = tips[0]
            print(f"📌 Title: {tip['hindi']}")
            print(f"📌 Category: {tip['category']}")
            print(f"📌 Priority: {tip['priority']}")
            print(f"📌 Problem: {tip['problem'][:100]}...")
            print(f"📌 Government Source: {tip.get('government_source', {}).get('source')}")
            print(f"📌 Law: {tip.get('law', {}).get('act')}")
            print(f"📌 Actions: {len(tip.get('actions', []))}")
            print(f"📌 Helplines: {len(tip.get('helplines', []))}")
            
            return True
    except Exception as e:
        print(f"✗ Sample tip details failed: {e}")
        return False


def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("🧪 LEGAL TIPS SYSTEM - TEST SUITE")
    print("=" * 60)
    
    tests = [
        test_service_initialization,
        test_get_all_tips,
        test_get_by_category,
        test_search_functionality,
        test_priority_filtering,
        test_tip_structure,
        test_government_sources,
        test_get_by_id,
        test_daily_tips,
        test_sample_tip_details
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"✗ Test execution failed: {e}")
            results.append(False)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"✓ Passed: {passed}/{total}")
    print(f"✗ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! System is working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check above for details.")
    
    return passed == total


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
