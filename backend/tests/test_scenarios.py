def test_scenario_1_vpn_incident(client):
    """Scenario 1: VPN failure -> Incident classification & ServiceNow ticket creation."""
    res = client.post("/api/chat", json={"user_request": "My VPN is not connecting. Authentication keeps failing."})
    assert res.status_code == 200
    data = res.json()
    assert data["workflow_type"] == "Incident"
    assert data["category"] == "Network"
    assert data["priority"] == "P2"
    assert data["assignment_group"] == "Network Support"
    
    # Create ticket in ServiceNow
    tck_res = client.post("/api/tickets", json={
        "subject": "VPN connection failure",
        "user_request": "My VPN is not connecting.",
        "category": data["category"],
        "priority": data["priority"],
        "assignment_group": data["assignment_group"]
    })
    assert tck_res.status_code == 200
    tck_data = tck_res.json()
    assert "servicenow_id" in tck_data
    assert tck_data["servicenow_id"].startswith("INC")

def test_scenario_2_password_reset(client):
    """Scenario 2: Password reset -> Automatable issue & mock password reset execution."""
    res = client.post("/api/chat", json={"user_request": "My password has expired."})
    assert res.status_code == 200
    data = res.json()
    assert data["workflow_type"] == "Automatable Issue"
    assert data["automation_allowed"] is True

    # Execute password reset
    auto_res = client.post("/api/automation/execute", json={
        "action": "password_reset",
        "ticket_id": "INC001002"
    })
    assert auto_res.status_code == 200
    auto_data = auto_res.json()
    assert auto_data["status"] == "Success"
    assert auto_data["mode"] == "MOCK"

def test_scenario_3_outlook_knowledge(client):
    """Scenario 3: Outlook sync question -> Vector search & grounded response."""
    res = client.post("/api/chat", json={"user_request": "How do I troubleshoot Outlook synchronization?"})
    assert res.status_code == 200
    data = res.json()
    assert data["workflow_type"] == "Knowledge Question"
    assert len(data["rag_sources"]) > 0
    assert any("outlook" in s["source"].lower() for s in data["rag_sources"])

def test_scenario_4_software_request(client):
    """Scenario 4: VS Code request -> Software catalogue & mock provisioning."""
    res = client.post("/api/chat", json={"user_request": "I need Visual Studio Code installed on my laptop."})
    assert res.status_code == 200
    data = res.json()
    assert data["workflow_type"] == "Service Request"

    sw_res = client.post("/api/software/request", json={
        "software_id": "vscode",
        "user_id": "alex@company.com"
    })
    assert sw_res.status_code == 200
    sw_data = sw_res.json()
    assert sw_data["software_name"] == "Visual Studio Code"
    assert sw_data["provisioning_status"] == "Provisioned (MOCK)"
    assert sw_data["servicenow_ref"].startswith("REQ")

def test_scenario_5_unsupported_no_hallucination(client):
    """Scenario 5: Unsupported query outside KB -> No hallucination warning & human escalation."""
    res = client.post("/api/chat", json={"user_request": "What is the policy for reimbursing luxury dinner expenses?"})
    assert res.status_code == 200
    data = res.json()
    assert data["unsupported"] is True
    assert data["human_escalation_required"] is True
    assert "Information unavailable" in data["ai_response"]
