"""Create a boundary-free, deny-by-default static Hostinger preview artifact.
This is packaging only: it does not upload, deploy, configure a domain or create credentials.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import zipfile

root = pathlib.Path(__file__).resolve().parent.parent
build = root / 'dist-private-preview'
assert build.is_dir(), 'Run npm run build:private-preview first'
(build / '.htaccess').write_bytes((root / 'hosting/private-preview.htaccess').read_bytes())
placeholder = json.loads((build / 'data/boundaries.json').read_text())
assert placeholder == {'status': 'blocked', 'reason': 'provenance-withheld', 'provenance': None, 'collection': None}
assert 'noindex' in (build / 'index.html').read_text()
assert 'Disallow: /' in (build / 'robots.txt').read_text()
assert re.search(r'^Require all denied$', (build / '.htaccess').read_text(), re.M)
source = json.loads((root / 'docs/source-evidence/uploaded/iui-yogyakarta-boundaries.geojson').read_text())
def points(node):
    if isinstance(node, list) and node and isinstance(node[0], (int, float)):
        yield node
    elif isinstance(node, list):
        for child in node:
            yield from points(child)
# These distinctive coordinate fingerprints would indicate accidental geometry copying/bundling.
fingerprints = set()
for feature in source['features']:
    for point in points(feature['geometry']['coordinates']):
        for number in point:
            fingerprints.add(str(number).encode())
files = sorted(p for p in build.rglob('*') if p.is_file())
entries = {}
for path in files:
    assert not path.is_symlink(), 'Unexpected symlink in artifact'
    name = path.relative_to(build).as_posix()
    assert name in ('index.html', 'robots.txt', '.htaccess', 'data/boundaries.json') or re.fullmatch(r'assets/[A-Za-z0-9_-]+\.(js|css)', name), f'Unexpected deploy file: {name}'
    body = path.read_bytes()
    assert not any(value in body for value in fingerprints), f'Boundary coordinates detected in {name}'
    entries[name] = {'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()}
artifact_dir = root / 'artifacts'
artifact_dir.mkdir(exist_ok=True)
archive = artifact_dir / 'iui-hostinger-private-preview.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for path in files:
        info = zipfile.ZipInfo(path.relative_to(build).as_posix())
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        info.compress_type = zipfile.ZIP_DEFLATED
        bundle.writestr(info, path.read_bytes())
with zipfile.ZipFile(archive) as bundle:
    assert sorted(bundle.namelist()) == sorted(entries)
    for name in bundle.namelist():
        assert (bundle.getinfo(name).external_attr >> 16) & 0o777 == 0o644, 'Unexpected archive file permissions'
        assert hashlib.sha256(bundle.read(name)).hexdigest() == entries[name]['sha256']
commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
dirty = bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=root, text=True).strip())
manifest = {'profile': 'private-preview', 'sourceCommit': commit, 'sourceWorkingTreeDirty': dirty,
            'boundaryGeometryIncluded': False, 'sourceEvidenceIncluded': False,
            'boundaryPlaceholder': placeholder, 'accessDefault': 'deny-all; configure new-site authentication before use',
            'hostingerDeploymentPerformed': False, 'files': entries,
            'archiveSha256': hashlib.sha256(archive.read_bytes()).hexdigest()}
(artifact_dir / 'iui-hostinger-private-preview-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print('Created artifacts/iui-hostinger-private-preview.zip')
print('Verified: no boundary geometry/source files; placeholder only; deny-by-default access.')
