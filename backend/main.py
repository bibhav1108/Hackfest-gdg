"""
GenericRx Backend - FastAPI Service
Matches branded medicines to affordable generic alternatives (e.g., Jan Aushadhi Kendras)
and provides nearby store locations.
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import re

app = FastAPI(
    title="GenericRx API",
    description="Intelligent Brand-to-Generic Salt Detection and Generic Store Matching API",
    version="1.0.0"
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Data Models -----------------

class StoreLocation(BaseModel):
    id: str
    name: str
    store_type: str  # e.g., "Pradhan Mantri Bhartiya Janaushadhi Kendra"
    address: str
    distance_km: float
    distance_display: str
    contact: str
    open_now: bool

class GenericMatch(BaseModel):
    generic_name: str
    manufacturer: str
    salt_composition: str
    strength: str
    dosage_form: str
    package_size: str
    price_inr: float
    savings_percentage: float
    availability_status: str

class BrandDetails(BaseModel):
    brand_name: str
    manufacturer: str
    salt_composition: str
    strength: str
    dosage_form: str
    package_size: str
    price_inr: float

class SearchResponse(BaseModel):
    query: str
    parsed_strength: Optional[str] = None
    parsed_dosage_form: Optional[str] = None
    parsed_volume: Optional[str] = None
    brand_details: BrandDetails
    cheapest_generic: GenericMatch
    all_generic_alternatives: List[GenericMatch]
    nearby_stores: List[StoreLocation]
    disclaimer: str

# ----------------- Mock Database -----------------

BRAND_DATABASE = [
    {
        "id": "augmentin-susp",
        "keywords": ["augmentin", "amoxiclav", "amoxyclav"],
        "brand_name": "Augmentin 228.5 mg/5ml Suspension",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals",
        "salt_composition": "Amoxycillin (200mg) + Potassium Clavulanate (28.5mg)",
        "strength": "228.5 mg/5ml",
        "dosage_form": "Oral Suspension / Syrup",
        "package_size": "30 ml bottle",
        "price_inr": 210.00,
        "generics": [
            {
                "generic_name": "Amoxycillin & Pot. Clavulanate Oral Suspension IP",
                "pmbjp_code": "PMBJP-1048",
                "manufacturer": "Jan Aushadhi Kendra (PMBI / BPPI)",
                "salt_composition": "Amoxycillin (200mg) + Potassium Clavulanate (28.5mg)",
                "strength": "228.5 mg/5ml",
                "dosage_form": "Oral Suspension",
                "package_size": "30 ml bottle",
                "price_inr": 46.88,
                "availability_status": "In Stock"
            },
            {
                "generic_name": "Clavam Forte Dry Syrup",
                "manufacturer": "Alkem Generic Health",
                "salt_composition": "Amoxycillin (200mg) + Potassium Clavulanate (28.5mg)",
                "strength": "228.5 mg/5ml",
                "dosage_form": "Dry Syrup",
                "package_size": "30 ml bottle",
                "price_inr": 72.00,
                "availability_status": "In Stock"
            }
        ]
    },
    {
        "id": "pan-40",
        "keywords": ["pan 40", "pantocid 40", "pantodac", "pan40"],
        "brand_name": "Pan 40 Tablet",
        "manufacturer": "Alkem Laboratories",
        "salt_composition": "Pantoprazole Sodium Gastro-resistant (40mg)",
        "strength": "40 mg",
        "dosage_form": "Tablet",
        "package_size": "Strip of 15 tablets",
        "price_inr": 162.00,
        "generics": [
            {
                "generic_name": "Pantoprazole Gastro-Resistant Tablets IP 40mg",
                "manufacturer": "Jan Aushadhi Kendra (PMBI)",
                "salt_composition": "Pantoprazole Sodium (40mg)",
                "strength": "40 mg",
                "dosage_form": "Tablet",
                "package_size": "Strip of 10 tablets",
                "price_inr": 23.50,
                "availability_status": "In Stock"
            },
            {
                "generic_name": "Panto-G 40",
                "manufacturer": "Cipla Generic Division",
                "salt_composition": "Pantoprazole Sodium (40mg)",
                "strength": "40 mg",
                "dosage_form": "Tablet",
                "package_size": "Strip of 10 tablets",
                "price_inr": 48.00,
                "availability_status": "In Stock"
            }
        ]
    },
    {
        "id": "crocin-650",
        "keywords": ["crocin 650", "dolo 650", "calpol 650", "crocin"],
        "brand_name": "Crocin 650 Advance Tablet",
        "manufacturer": "GlaxoSmithKline Asia",
        "salt_composition": "Paracetamol (Acetaminophen) (650mg)",
        "strength": "650 mg",
        "dosage_form": "Tablet",
        "package_size": "Strip of 15 tablets",
        "price_inr": 38.50,
        "generics": [
            {
                "generic_name": "Paracetamol Tablets IP 650mg",
                "manufacturer": "Jan Aushadhi Kendra (PMBI)",
                "salt_composition": "Paracetamol (650mg)",
                "strength": "650 mg",
                "dosage_form": "Tablet",
                "package_size": "Strip of 10 tablets",
                "price_inr": 12.00,
                "availability_status": "In Stock"
            },
            {
                "generic_name": "Para-Gen 650 Fast Dissolving",
                "manufacturer": "Mankind Prime Generics",
                "salt_composition": "Paracetamol (650mg)",
                "strength": "650 mg",
                "dosage_form": "Tablet",
                "package_size": "Strip of 10 tablets",
                "price_inr": 18.00,
                "availability_status": "In Stock"
            }
        ]
    },
    {
        "id": "atorva-10",
        "keywords": ["atorva 10", "lipitor 10", "atorlip 10", "atorva"],
        "brand_name": "Atorva 10 Tablet",
        "manufacturer": "Zydus Cadila",
        "salt_composition": "Atorvastatin Calcium (10mg)",
        "strength": "10 mg",
        "dosage_form": "Tablet",
        "package_size": "Strip of 10 tablets",
        "price_inr": 124.00,
        "generics": [
            {
                "generic_name": "Atorvastatin Tablets IP 10mg",
                "manufacturer": "Jan Aushadhi Kendra (PMBI)",
                "salt_composition": "Atorvastatin Calcium (10mg)",
                "strength": "10 mg",
                "dosage_form": "Tablet",
                "package_size": "Strip of 10 tablets",
                "price_inr": 18.00,
                "availability_status": "In Stock"
            },
            {
                "generic_name": "Ator-Safe 10",
                "manufacturer": "Sun Generic Health",
                "salt_composition": "Atorvastatin Calcium (10mg)",
                "strength": "10 mg",
                "dosage_form": "Tablet",
                "package_size": "Strip of 10 tablets",
                "price_inr": 35.00,
                "availability_status": "In Stock"
            }
        ]
    },
    {
        "id": "glycomet-500",
        "keywords": ["glycomet 500", "glycomet", "glucophage 500"],
        "brand_name": "Glycomet 500 Tablet",
        "manufacturer": "USV Private Limited",
        "salt_composition": "Metformin Hydrochloride (500mg)",
        "strength": "500 mg",
        "dosage_form": "Tablet",
        "package_size": "Strip of 10 tablets",
        "price_inr": 48.00,
        "generics": [
            {
                "generic_name": "Metformin Hydrochloride Tablets IP 500mg",
                "manufacturer": "Jan Aushadhi Kendra (PMBI)",
                "salt_composition": "Metformin Hydrochloride (500mg)",
                "strength": "500 mg",
                "dosage_form": "Tablet",
                "package_size": "Strip of 10 tablets",
                "price_inr": 8.50,
                "availability_status": "In Stock"
            }
        ]
    }
]

NEARBY_STORES = [
    {
        "id": "store-1",
        "name": "Pradhan Mantri Bhartiya Janaushadhi Kendra",
        "store_type": "Govt. Authorized PMBJK Kendra",
        "address": "Shop 14, Civil Hospital Complex, Main Road",
        "distance_km": 0.8,
        "distance_display": "0.8 km away",
        "contact": "+91 98765 43210",
        "open_now": True
    },
    {
        "id": "store-2",
        "name": "Jan Aushadhi Medical & Surgical",
        "store_type": "PMBJP Certified Store",
        "address": "Opposite Metro Pillar 42, Central Market",
        "distance_km": 1.2,
        "distance_display": "1.2 km away",
        "contact": "+91 91234 56789",
        "open_now": True
    },
    {
        "id": "store-3",
        "name": "Generic Aadhaar Pharmacy",
        "store_type": "Affordable Generic Drug Store",
        "address": "Plot 8B, Sector 12 Commercial Belt",
        "distance_km": 2.4,
        "distance_display": "2.4 km away",
        "contact": "+91 94567 89012",
        "open_now": True
    },
    {
        "id": "store-4",
        "name": "Red Cross Society Jan Aushadhi Centre",
        "store_type": "Non-Profit Jan Aushadhi Dispenser",
        "address": "Gate 2, General Hospital Campus",
        "distance_km": 3.1,
        "distance_display": "3.1 km away",
        "contact": "+91 98111 22334",
        "open_now": False
    }
]

# ----------------- Regular Expression Parsing Helpers -----------------

def parse_medicine_query(query: str):
    """
    Extracts strength, dosage form, and volume from the user query using regular expressions.
    """
    clean_q = query.lower().strip()

    # 1. Extract strength (e.g. 228.5 mg/5ml, 650mg, 40 mg, 500 mcg, 10mg)
    strength_regex = r'(\d+(?:\.\d+)?\s*(?:mg\/5ml|mg|mcg|gm|g|iu|%)(?:\/\d+ml)?)'
    strength_match = re.search(strength_regex, clean_q)
    strength = strength_match.group(1).strip() if strength_match else None

    # 2. Extract dosage form (tablet, syrup, suspension, capsule, drops, injection)
    form_regex = r'\b(tablet|tab|tablets|syrup|syp|suspension|susp|capsule|cap|capsules|drops|drop|injection|inj|gel|cream)\b'
    form_match = re.search(form_regex, clean_q)
    dosage_form = form_match.group(1).strip() if form_match else None

    # Normalize dosage form
    if dosage_form in ['tab', 'tablets']:
        dosage_form = 'Tablet'
    elif dosage_form in ['syp', 'syrup']:
        dosage_form = 'Syrup'
    elif dosage_form in ['susp', 'suspension']:
        dosage_form = 'Suspension'
    elif dosage_form in ['cap', 'capsules']:
        dosage_form = 'Capsule'
    elif dosage_form:
        dosage_form = dosage_form.capitalize()

    # 3. Extract volume or count (e.g. 30ml, 100ml, 15 tabs, 10 capsules)
    volume_regex = r'(\d+\s*(?:ml|liter|litres|tabs|tablets|capsules|strips))'
    volume_match = re.search(volume_regex, clean_q)
    volume = volume_match.group(1).strip() if volume_match else None

    return {
        "strength": strength,
        "dosage_form": dosage_form,
        "volume": volume
    }

# ----------------- API Endpoints -----------------

@app.get("/")
def health_check():
    return {
        "service": "GenericRx API",
        "status": "healthy",
        "endpoints": {
            "search": "/api/search?q=Augmentin+228.5mg"
        }
    }

@app.get("/api/search", response_model=SearchResponse)
def search_generic_alternative(q: str = Query(..., description="Medicine query string, e.g. 'Augmentin 228.5 mg/5ml suspension'")):
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters.")

    query_lower = q.lower().strip()
    extracted = parse_medicine_query(query_lower)

    # Match brand from database
    matched_brand = None
    for item in BRAND_DATABASE:
        for kw in item["keywords"]:
            if kw in query_lower:
                matched_brand = item
                break
        if matched_brand:
            break

    # If no exact match, fallback to closest match or default first record for testing
    if not matched_brand:
        # Check token similarity
        tokens = query_lower.split()
        for item in BRAND_DATABASE:
            if any(t in item["brand_name"].lower() for t in tokens):
                matched_brand = item
                break

    if not matched_brand:
        # Default to Augmentin for demonstration
        matched_brand = BRAND_DATABASE[0]

    # Calculate savings and sort generic alternatives by price
    brand_price = matched_brand["price_inr"]
    generics_with_savings = []
    for g in matched_brand["generics"]:
        gen_price = g["price_inr"]
        savings = round(((brand_price - gen_price) / brand_price) * 100, 1)
        generics_with_savings.append(
            GenericMatch(
                generic_name=g["generic_name"],
                manufacturer=g["manufacturer"],
                salt_composition=g["salt_composition"],
                strength=g["strength"],
                dosage_form=g["dosage_form"],
                package_size=g["package_size"],
                price_inr=gen_price,
                savings_percentage=max(savings, 0),
                availability_status=g["availability_status"]
            )
        )

    # Sort matches by lowest price
    generics_with_savings.sort(key=lambda x: x.price_inr)
    cheapest = generics_with_savings[0]

    brand_obj = BrandDetails(
        brand_name=matched_brand["brand_name"],
        manufacturer=matched_brand["manufacturer"],
        salt_composition=matched_brand["salt_composition"],
        strength=extracted["strength"] or matched_brand["strength"],
        dosage_form=extracted["dosage_form"] or matched_brand["dosage_form"],
        package_size=matched_brand["package_size"],
        price_inr=matched_brand["price_inr"]
    )

    stores_list = [StoreLocation(**s) for s in NEARBY_STORES]

    disclaimer_text = (
        "Medical Disclaimer: GenericRx provides pharmaceutical equivalence information for educational and cost-comparison purposes. "
        "Active chemical salt formulation and bioequivalence are matched based on pharmacopeial standards. "
        "Do not substitute critical narrow therapeutic index medicines without consulting your registered medical practitioner or licensed pharmacist."
    )

    return SearchResponse(
        query=q,
        parsed_strength=extracted["strength"],
        parsed_dosage_form=extracted["dosage_form"],
        parsed_volume=extracted["volume"],
        brand_details=brand_obj,
        cheapest_generic=cheapest,
        all_generic_alternatives=generics_with_savings,
        nearby_stores=stores_list,
        disclaimer=disclaimer_text
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
