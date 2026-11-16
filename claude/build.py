import json,sys
cfg=open('/home/claude/kb/fuera/config.json').read().strip()
s=open('/home/claude/kb/index.html').read()
shim=open('/home/claude/kb/fuera/shim.js').read().replace('__FBCFG__',cfg)
v='10.12.2'
libs=''.join(f'<script src="https://www.gstatic.com/firebasejs/{v}/firebase-{m}-compat.js"></script>' for m in ['app','auth','firestore'])
i=s.find('<script>')
out=s[:i]+libs+'<script>'+shim+'</script>'+s[i:]
out=out.replace('<head>','<head><meta name="robots" content="noindex"><link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#141418"><link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Clases KB"><meta name="mobile-web-app-capable" content="yes">',1)
out=out.replace('</body>','<script>if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});</script></body>',1)
open('/home/claude/kb/fuera/index.html','w').write(out)
print('ok',len(out))
