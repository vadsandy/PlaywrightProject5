@UI @REGRESSION
Feature: Logout Functionality

    Scenario: Successful logout after session is active
        Given I enter username "testuser1" and password "Test@123" on login page and click login button
        When I click on the Logout button
        Then I should be redirected to the login page
        And I should see the "Login" button to confirm I am out 
