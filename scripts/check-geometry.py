"""Validate supplied GeoJSON without repair/reprojection. Coordinates are interpreted as RFC7946.
Usage: python check-geometry.py source.geojson. JSON report goes to stdout; errors are fatal.
"""
import hashlib
import json
import math
import sys
import shapely
from shapely.geometry import shape, Point
from shapely.ops import unary_union
from shapely.validation import explain_validity

source = open(sys.argv[1], 'rb').read()
data = json.loads(source)
assert data.get('type') == 'FeatureCollection' and len(data['features']) == 3
expected = {
    'Kota Yogyakarta': ('22746128B9761158776103', (110.3695, -7.7956)),
    'Sleman': ('22746128B68764842139539', (110.3556, -7.7167)),
    'Bantul': ('22746128B15956982783625', (110.3289, -7.8879)),
}
seen = set()
features = []
geometries = []
for feature in data['features']:
    properties = feature['properties']
    name = properties['shapeName']
    assert name in expected and name not in seen, 'Missing, duplicate or unexpected region'
    seen.add(name)
    assert properties['shapeGroup'] == 'IDN' and properties['shapeType'] == 'ADM2'
    assert properties['shapeID'] == expected[name][0], 'Unexpected dataset/feature ID'
    geometry = shape(feature['geometry'])
    assert geometry.geom_type in ('Polygon', 'MultiPolygon')
    assert geometry.is_valid, explain_validity(geometry)
    assert not geometry.is_empty and geometry.area > 0, 'Empty/zero-area region'
    polygons = [geometry] if geometry.geom_type == 'Polygon' else list(geometry.geoms)
    count = 0
    for polygon in polygons:
        assert polygon.exterior.is_ccw, 'Exterior ring is not RFC7946 counter-clockwise'
        for ring in [polygon.exterior] + list(polygon.interiors):
            coordinates = list(ring.coords)
            assert len(coordinates) >= 4 and coordinates[0] == coordinates[-1]
            assert all(len(p) == 2 and all(math.isfinite(v) for v in p) for p in coordinates)
            assert all(109.8 <= p[0] <= 110.9 and -8.2 <= p[1] <= -7.4 for p in coordinates)
            count += len(coordinates)
        assert all(not ring.is_ccw for ring in polygon.interiors), 'Hole winding differs from RFC7946'
    point = geometry.representative_point()
    assert geometry.contains(point)
    assert geometry.contains(Point(expected[name][1])), 'Existing reference marker lies outside supplied region'
    features.append({'name': name, 'sourceShapeId': properties['shapeID'], 'geometryType': geometry.geom_type,
                     'valid': True, 'nonempty': True, 'vertexCount': count, 'bounds': list(geometry.bounds),
                     'representativePoint': [point.x, point.y], 'referenceMarkerContained': True})
    geometries.append(geometry)
pairs = []
for i, left in enumerate(geometries):
    for j, right in enumerate(geometries[i+1:], start=i+1):
        intersection = left.intersection(right)
        assert intersection.area == 0, 'Administrative polygon interiors overlap'
        pairs.append({'regions': [features[i]['name'], features[j]['name']],
                      'interiorOverlap': False, 'sharedBoundary': not intersection.is_empty})
union = unary_union(geometries)
report = {'validator': 'Shapely', 'validatorVersion': shapely.__version__,
          'sourceSha256': hashlib.sha256(source).hexdigest(), 'datasetIdChecked': 'IDN-ADM2-22746128',
          'identityCheck': 'Uploaded properties and shape-ID prefix; upstream equality unverified',
          'crsDeclaration': data.get('crs'),
          'crsInterpretation': 'RFC7946 default WGS84 longitude/latitude (OGC:CRS84); range/order/winding checked; no original CRS metadata supplied',
          'features': features, 'pairs': pairs, 'unionValid': union.is_valid,
          'unionGeometryType': union.geom_type, 'collectionBounds': list(union.bounds),
          'repairsApplied': False, 'reprojectionApplied': False}
print(json.dumps(report, indent=2))
