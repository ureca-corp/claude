# PostGIS Location Storage

## Model

```python
from sqlmodel import Field, SQLModel, Column
from geoalchemy2 import Geometry

class Location(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    
    # latlng (client response)
    latitude: float
    longitude: float
    
    # PostGIS POINT (spatial queries)
    location: Geometry = Field(sa_column=Column(Geometry("POINT", srid=4326)))
```

## Create

```python
from geoalchemy2.elements import WKTElement

def create_location(name: str, lat: float, lng: float, db: Session):
    point = WKTElement(f"POINT({lng} {lat})", srid=4326)
    
    loc = Location(
        name=name,
        latitude=lat,
        longitude=lng,
        location=point
    )
    db.add(loc)
    db.commit()
    return loc
```

## Distance Query

```python
from sqlalchemy import func
from geoalchemy2 import Geography

def find_nearby(lat: float, lng: float, radius_km: float, db: Session):
    point = WKTElement(f"POINT({lng} {lat})", srid=4326)
    
    query = select(Location).where(
        func.ST_DWithin(
            func.ST_Transform(Location.location, 4326).cast(Geography),
            func.ST_Transform(point, 4326).cast(Geography),
            radius_km * 1000  # km → meter
        )
    )
    return db.exec(query).all()
```

## Setup

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```
