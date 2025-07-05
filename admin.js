 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a//dev/null b/admin.js
index 0000000000000000000000000000000000000000..95c2ba64fc944b4077f9db1897eeb8092b012d43 100644
--- a//dev/null
+++ b/admin.js
@@ -0,0 +1,20 @@
+document.addEventListener('DOMContentLoaded', () => {
+  const tbody = document.getElementById('entries');
+
+  async function loadEntries() {
+    try {
+      const res = await fetch('/admin/entries');
+      const entries = await res.json();
+      entries.forEach(entry => {
+        const tr = document.createElement('tr');
+        const time = new Date(entry.timestamp).toLocaleString('cs-CZ');
+        tr.innerHTML = `<td>${time}</td><td>${JSON.stringify(entry.data)}</td>`;
+        tbody.appendChild(tr);
+      });
+    } catch (err) {
+      console.error('Failed to load entries', err);
+    }
+  }
+
+  loadEntries();
+});
 
EOF
)
