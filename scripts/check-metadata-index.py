"""Verify the exact official CSV evidence and derived row, using only retained files."""
import csv
import hashlib
import io
import json
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
folder = root / 'docs/source-evidence/geoboundaries-metadata-index'
evidence = json.loads((folder / 'IDN-ADM2-22746128.json').read_text())
body = (folder / 'geoBoundariesOpen-meta.csv').read_bytes()
assert hashlib.sha256(body).hexdigest() == evidence['indexSha256']
assert evidence['repositoryCommit'] == '8ce2700661a28ee944350e2b329bbabb58d2ff83'
rows = [r for r in csv.DictReader(io.StringIO(body.decode())) if r['boundaryID'] == 'IDN-ADM2-22746128']
assert len(rows) == 1 and rows[0] == evidence['row']
r = rows[0]
assert r['boundaryISO'] == 'IDN' and r['boundaryType'] == 'ADM2' and r['boundaryYearRepresented'] == '2020'
assert r['boundaryLicense'] == 'Creative Commons Attribution 3.0 Intergovernmental Organisations (CC BY 3.0 IGO)'
assert r['boundarySource'] == 'Badan Pusat Statistik (BPS - Statistics Indonesia), World Food Programme, OCHA ROAP'
print(json.dumps(evidence))
