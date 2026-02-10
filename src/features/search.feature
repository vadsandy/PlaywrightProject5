@UI @SEARCH
Feature: Search Book

    Scenario: Successful display of the book to be searched
        Given I open the landing page
        When I click on the "Book Store Application" tile
        Then the URL should contain "/books"
        When I type the book name "Speaking JavaScript" in the search box
        Then I should see the book "Speaking JavaScript" in the first row