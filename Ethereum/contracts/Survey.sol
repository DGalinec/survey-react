pragma solidity ^0.4.24;

contract Survey {

  struct Choice {
    uint id;
    string name;
    uint voteCount;
    bool deleted;
  }

  address public manager;

  string public surveyQuestion;
  
  mapping(uint => Choice) public choices;

  uint public choicesCount;

  mapping(address => bool) public voters;

  //because of 'indexed' keyword the 'getPastEvents()' function does not work
  event votedEvent (uint _choiceId);
  event addedChoiceEvent (string _newChoice);
  event addedQuestionEvent (string _question);
  event deletedEvent (uint _choiceId);
  event undeletedEvent(uint _choiceId);

  constructor () public {
    manager = msg.sender;
  }

  function addChoice(string _name) public restricted {
    choicesCount++;
    choices[choicesCount] = Choice(choicesCount, _name, 0, false);
    emit addedChoiceEvent(_name);
  }

  function deleteChoice(uint _choiceId) public restricted {
    choices[_choiceId].deleted = true;
    emit deletedEvent(_choiceId);
  }

  function undeleteChoice(uint _choiceId) public restricted {
    choices[_choiceId].deleted = false;
    emit undeletedEvent(_choiceId);
  }

  function setSurveyQuestion(string _question) public restricted {
    surveyQuestion = _question;
    emit addedQuestionEvent(_question);
  }

  function vote (uint _choiceId) public {
    require(!voters[msg.sender]);
    require((_choiceId > 0) && (_choiceId <= choicesCount));
    choices[_choiceId].voteCount++;
    voters[msg.sender] = true;
    emit votedEvent(_choiceId);
  }

  modifier restricted() {
    require(msg.sender == manager);
      _;
  }
}