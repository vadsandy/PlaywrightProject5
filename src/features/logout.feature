Feature: Logout Functionality

  Background:
    Given I am logged into the application with valid credentials

  Scenario: User should be able to logout successfully
    When I click on the Logout button
    Then I should be redirected to the login page
    And I should see the "Login" header to confirm I am out