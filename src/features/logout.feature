@UI @REGRESSION
Feature: Logout Functionality

  Background:
    Given I navigate to the login page
    When I enter username "testuser1" and password "Test@123"
    And I click the login button
    Then I should see a logout button

  Scenario: Successful logout after session is active
    When I click on the Logout button
    Then I should be redirected to the login page
    And I should see the "Login" header to confirm I am out