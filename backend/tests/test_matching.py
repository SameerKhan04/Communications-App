from ..main import get_matches
from ..database import mock_users

def test_one_user_match():
    initial_user = mock_users[0]
    all_users = mock_users[9:]

    result = get_matches(initial_user, all_users)
    assert len(result) == 1
    assert result[0]["user"]["id"] == "u10"

def test_three_user_match():
    initial_user = mock_users[5]
    all_users = mock_users[7:]

    result = get_matches(initial_user, all_users)
    assert len(result) == 2
    assert result[0]["user"]["id"] == "u8"
    assert result[1]["user"]["id"] == "u10"

def test_no_users_returned():
    initial_user = mock_users[5]
    all_users = mock_users[8:9]

    result = get_matches(initial_user, all_users)
    assert result == []

def test_full_users():
    initial_user = mock_users[3]
    all_users = mock_users

    result = get_matches(initial_user, all_users)
    assert len(result) == 5