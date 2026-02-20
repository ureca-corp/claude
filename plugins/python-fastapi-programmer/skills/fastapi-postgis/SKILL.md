---
name: python-fastapi-programmer:fastapi-postgis
description: PostGIS location storage patterns for FastAPI with SQLModel. Use when implementing location features requiring latitude/longitude storage, spatial indexing, or distance calculations. Stores both latlng (client response) and PostGIS POINT geometry (spatial queries).
---

# FastAPI PostGIS Patterns

## Storage Strategy

Store BOTH formats:
1. **latlng**: latitude, longitude columns (client response)
2. **PostGIS POINT**: geometry column (spatial indexing, distance queries)

## Pattern

See [postgis-storage.md](references/postgis-storage.md) for complete implementation.

## Quick Example

```python
from geoalchemy2 import Geometry
from geoalchemy2.elements import WKTElement

class Location(SQLModel, table=True):
    latitude: float
    longitude: float
    location: Geometry = Field(sa_column=Column(Geometry("POINT", srid=4326)))

# Store
point = WKTElement(f"POINT({lng} {lat})", srid=4326)
loc = Location(latitude=lat, longitude=lng, location=point)
db.add(loc)

# Distance query
query = select(Location).where(
    func.ST_DWithin(Location.location, point, radius_meters)
)
```
