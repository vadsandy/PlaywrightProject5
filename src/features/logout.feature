@UI @REGRESSION
Feature: Logout Functionality

    Scenario: Successful logout after session is active
        Given I navigate to the login page
        When I enter username "testuser1" and password "Test@123"
        When I click the login button
        When I click on the Logout button
        Then I should be redirected to the login page
        And I should see the "Login" button to confirm I am out 
