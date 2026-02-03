Feature: Login Functionality

@fireup
Scenario: Login with hardcoded credentials
    Given I navigate to the login page
    When I enter username "testuser1" and password "Test@123"
    And I click the login button
    Then I should see a logout button

@UI @JSON @Smoke @Regression
Scenario: Login with data from json file
    Given I navigate to the login page
    When I enter username and password from "data/json/users.json" and key "validUser"
    And I click the login button
    Then I should see a logout button

@UI @Excel @Smoke @Regression
Scenario: Login with data from Excel
    Given I navigate to the login page
    When I enter username and password from "data/excel/users.xlsx" in "Sheet1" with key "validUser"
    And I click the login button
    Then I should see a logout button

@UI @SQL @Smoke @Regression
Scenario: Login with data from SQL
    Given I navigate to the login page
    When I enter username and password from "SELECT username, password from Users where username='testuser1'"
    And I click the login button
    Then I should see a logout button