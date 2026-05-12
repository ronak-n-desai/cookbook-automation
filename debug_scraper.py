import urllib.request, urllib.parse, re, json, sys
sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}
pattern = r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>([\s\S]*?)</script>'

recipe_url = 'https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/'

# Test proxies to find one that works
proxies = [
    ('corsproxy.io', f'https://corsproxy.io/?url={urllib.parse.quote(recipe_url)}'),
    ('codetabs', f'https://api.codetabs.com/v1/proxy?quest={urllib.parse.quote(recipe_url)}'),
    ('allorigins', f'https://api.allorigins.win/get?url={urllib.parse.quote(recipe_url)}'),
]

for name, proxy_url in proxies:
    try:
        req = urllib.request.Request(proxy_url, headers=headers)
        res = urllib.request.urlopen(req, timeout=12)
        raw = res.read()
        # allorigins wraps in JSON
        if 'allorigins' in name:
            html = json.loads(raw)['contents']
        else:
            html = raw.decode('utf-8', errors='replace')
        
        matches = re.findall(pattern, html, re.IGNORECASE)
        found_recipe = False
        for m in matches:
            try:
                obj = json.loads(m.strip())
                items = obj if isinstance(obj, list) else [obj]
                for item in items:
                    t = item.get('@type', '')
                    type_list = t if isinstance(t, list) else [t]
                    if 'Recipe' in type_list:
                        found_recipe = True
                        print(f'[{name}] ✅ Recipe found! Name: {item.get("name")}')
                    if item.get('@graph'):
                        for g in item['@graph']:
                            gt = g.get('@type', '')
                            gtl = gt if isinstance(gt, list) else [gt]
                            if 'Recipe' in gtl:
                                found_recipe = True
                                print(f'[{name}] ✅ Recipe found in @graph! Name: {g.get("name")}')
            except: pass
        if not found_recipe:
            print(f'[{name}] ❌ No recipe found. HTML len={len(html)}, ld+json blocks={len(matches)}')
    except Exception as e:
        print(f'[{name}] FAIL: {e}')
