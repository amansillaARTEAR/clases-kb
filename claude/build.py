import json,sys
cfg=open('/home/claude/kb/fuera/config.json').read().strip()
s=open('/home/claude/kb/index.html').read()
shim=open('/home/claude/kb/fuera/shim.js').read().replace('__FBCFG__',cfg)
v='10.12.2'
libs=''.join(f'<script src="https://www.gstatic.com/firebasejs/{v}/firebase-{m}-compat.js"></script>' for m in ['app','auth','firestore'])
i=s.find('<script>')
out=s[:i]+libs+'<script>'+shim+'</script>'+s[i:]
out=out.replace('<head>','<head><meta name="robots" content="noindex">',1)
open('/home/claude/kb/fuera/index.html','w').write(out)
print('ok',len(out))
