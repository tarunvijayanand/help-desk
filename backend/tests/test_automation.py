def test_automation_and_audit(client):
    exec_res = client.post("/api/automation/execute", json={
        "action": "account_unlock",
        "ticket_id": "INC001005"
    })
    assert exec_res.status_code == 200
    assert exec_res.json()["status"] == "Success"

    audit_res = client.get("/api/automation/audit")
    assert audit_res.status_code == 200
    audit_list = audit_res.json()
    assert len(audit_list) > 0
