def test_servicenow_mock_api(client):
    create_res = client.post("/api/servicenow/incidents", json={
        "subject": "Test ServiceNow Incident",
        "category": "Network",
        "priority": "P2"
    })
    assert create_res.status_code == 200
    inc_data = create_res.json()
    assert "number" in inc_data
    inc_num = inc_data["number"]

    get_res = client.get(f"/api/servicenow/incidents/{inc_num}")
    assert get_res.status_code == 200
    assert get_res.json()["number"] == inc_num
