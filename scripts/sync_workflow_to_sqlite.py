import sqlite3
import json
import os
import subprocess

DB_TEMP = "/home/camper/proyecto-ia2-santiago-tomas/temp_n8n_database.sqlite"
WF_PATH = "/home/camper/proyecto-ia2-santiago-tomas/n8n/workflows/RutaIA_RAG_Optimizado_n8n.json"
WF_ID = "fQ6iXeKinQs6nBVC"

print("1. Copying database.sqlite from rutaia_n8n container...")
subprocess.run(["docker", "cp", "rutaia_n8n:/home/node/.n8n/database.sqlite", DB_TEMP], check=True)

with open(WF_PATH, "r", encoding="utf-8") as f:
    wf = json.load(f)

nodes_str = json.dumps(wf.get("nodes", []))
conn_str = json.dumps(wf.get("connections", {}))
pin_str = json.dumps(wf.get("pinData", {}))
settings_str = json.dumps(wf.get("settings", {}))

print(f"2. Connecting to SQLite at {DB_TEMP}...")
conn = sqlite3.connect(DB_TEMP)
cursor = conn.cursor()

cursor.execute("SELECT activeVersionId FROM workflow_entity WHERE id = ?", (WF_ID,))
row = cursor.fetchone()
active_version_id = row[0] if row else None
print(f"Active version ID: {active_version_id}")

cursor.execute("""
    UPDATE workflow_entity 
    SET nodes = ?, connections = ?, pinData = ?, settings = ? 
    WHERE id = ?
""", (nodes_str, conn_str, pin_str, settings_str, WF_ID))
print(f"Updated workflow_entity rows: {cursor.rowcount}")

cursor.execute("""
    UPDATE workflow_history 
    SET nodes = ?, connections = ? 
    WHERE workflowId = ?
""", (nodes_str, conn_str, WF_ID))
print(f"Updated workflow_history rows: {cursor.rowcount}")

conn.commit()
conn.close()

print("3. Copying updated database.sqlite back to rutaia_n8n container...")
subprocess.run(["docker", "cp", DB_TEMP, "rutaia_n8n:/home/node/.n8n/database.sqlite"], check=True)

if os.path.exists(DB_TEMP):
    os.remove(DB_TEMP)

print("4. Restarting rutaia_n8n...")
subprocess.run(["docker", "restart", "rutaia_n8n"], check=True)

print("Done! n8n workflow synchronized and restarted.")
