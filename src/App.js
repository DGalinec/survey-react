import React, { Component } from 'react';
import web3 from './web3'; 
import survey from './survey';
import './App.css';
import EnterText from './components/EnterText';
import ListItem from './components/ListItem';

class App extends Component {

  state = {
    manager: '',
    account: '',
    surveyQuestion: '',
    choices: [],
    choicesCount: 0,
    voted: true,
    accountIsManager: false,
    enterNewQuestion: false,
    enterNewChoice: false,
    messageWarning: false,
    messageWarningText: '',
    idAddedChoiceEvent: '',
    idVotedEvent: '',
    idQuestionEvent: '',
    idDeletedEvent: '',
    idUndeletedEvent: ''
  }

  async componentDidMount() {
    const manager = await survey.methods.manager().call();
    const surveyQuestion = await survey.methods.surveyQuestion().call();
    const choicesCount = await survey.methods.choicesCount().call();
    let choices = [];

    let i=1;
    while (i<=choicesCount) {
      let oneChoice = await survey.methods.choices(i).call();
      choices.push(oneChoice);
      i++;
    }

    this.setState({ manager, surveyQuestion, choicesCount, choices });
  }

  //write new survey question on the blockchain
  onSubmitNewQuestion = async (inputText) => {

    this.setState({ enterNewQuestion: false });

    if (this.state.accountIsManager) {
      const messageText = "Loading a new survey question...: " + inputText;
      this.setState({ messageWarning: true, messageWarningText: messageText });

      try {
        await survey.methods.setSurveyQuestion(inputText).send({ 
          from: this.state.account,
          gas: 3000000
        });
      } catch(err) {
        this.setState({ messageWarningText: err.message });
      }
    }   
  }

  onButtonQuestionClick = () => {
    this.setState({ messageWarning: false, messageWarningText: '' });
    this.setState(prevState => ({ enterNewQuestion: !prevState.enterNewQuestion }));
  }

  textButtonQuestion = () => {
    if (this.state.enterNewQuestion === true ) {
      return <span className="btn-warning btn-sm">close</span>;
    } else {
      return <span className="btn-primary btn-sm">edit</span>;
    }
  }

  //if you are the survey manager, 'delete' a choice on the blockchain
  handleDelete = async (choiceId) => {
    console.log('delete choice #', choiceId);

    if (this.state.accountIsManager) {
      const messageText = "Deleting a survey choice...: " + choiceId;
      this.setState({ messageWarning: true, messageWarningText: messageText });

      try {
        await survey.methods.deleteChoice(choiceId).send({
          from: this.state.account,
          gas: 3000000
        });
      } catch(err) {
        this.setState({ messageWarningText: err.message });
      }
    }
  }

  //if you are the survey manager, 'undelete' a choice on the blockchain
  handleUndelete = async (choiceId) => {
    console.log('undelete choice #', choiceId);

    if (this.state.accountIsManager) {
      const messageText = "Undeleting a survey choice...: " + choiceId;
      this.setState({ messageWarning: true, messageWarningText: messageText });

      try {
        await survey.methods.undeleteChoice(choiceId).send({
          from: this.state.account,
          gas: 3000000
        });
      } catch(err) {
        this.setState({ messageWarningText: err.message });
      }
    }
  }

  handleVote = async (choiceId) => {
    console.log('choice ID = ', choiceId);
    //const accounts = await web3.eth.getAccounts();
    this.setState({ messageWarning: false, messageWarningText: '' });
    let voted = true;
    if (this.state.account !== null) {
      voted = await survey.methods.voters(this.state.account).call();

      if (!voted) {
        try {
          const messageText = "Voting for candidate...: " + choiceId;
          this.setState({ messageWarning: true, messageWarningText: messageText });

          await survey.methods.vote(choiceId).send({
            from: this.state.account,
            gas: 3000000
          });
        } catch(err) {
          this.setState({ messageWarningText: err.message });
        }
      } else {
        this.setState({ messageWarning: true, messageWarningText: "You already have voted once !" });
      }
    }
    
    console.log('voted = ', voted, ' - account = ', this.state.account.toString());
  }

  onSubmitNewChoice = async (inputText) => {
    this.setState({ enterNewChoice: false });
    console.log('new choice: ', inputText);

    if (this.state.accountIsManager) {
      const messageText = "Adding a new survey choice...: " + inputText;
      this.setState({ messageWarning: true, messageWarningText: messageText });

      try {
        await survey.methods.addChoice(inputText).send({
          from: this.state.account,
          gas: 3000000
        });
      } catch(err) {
        this.setState({ messageWarningText: err.message });
      }
    }
  }

  onButtonChoiceClick = () => {
    this.setState({ messageWarning: false, messageWarningText: '' });
    this.setState(prevState => ({ enterNewChoice: !prevState.enterNewChoice }));
  }

  textButtonChoice = () => {
    if (this.state.enterNewChoice === true ) {
      return <span className="btn-warning btn-sm">close input field</span>;
    } else {
      return <span className="btn-primary btn-sm">add a choice</span>;
    }
  }

  listenForEvents = () => {
    // Load account data and update 'accountIsManager' flag
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        this.setState({ account: account });

        if (this.state.account !== null && this.state.manager !== null) {
          if (this.state.account.toLowerCase() === this.state.manager.toLowerCase()) {
            if (this.state.accountIsManager === false) {
              this.setState({ accountIsManager: true });
            }
          } else if (this.state.accountIsManager === true) { this.setState({ accountIsManager: false }); }
        } else if (this.state.accountIsManager === true) { this.setState({ accountIsManager: false }); }
      } 
    });
  }

  watchVotedEvent = async () => {
    const votedEvent = await survey.getPastEvents('votedEvent');

    if (votedEvent.length > 0) {
      if (votedEvent[0].id !== this.state.idVotedEvent) {
        this.setState({ idVotedEvent: votedEvent[0].id });
        console.log('NEW VOTED EVENT OCCURED ', this.state.idVotedEvent, ' object size: ', votedEvent.length);
        console.log(votedEvent[0]);

        const choicesCount = await survey.methods.choicesCount().call();

        let i=1;
        let choices = [];
        while (i<=choicesCount) {
          let oneChoice = await survey.methods.choices(i).call();
          choices.push(oneChoice);
          i++;
        }
        this.setState({ choices, choicesCount });
        this.setState({ messageWarning: false, messageWarningText: '', voted: true });
      }
    }
  }

  watchAddedChoiceEvent = async () => {
    const addedChoice = await survey.getPastEvents('addedChoiceEvent');

    if (addedChoice.length > 0) {
      if (addedChoice[0].id !== this.state.idAddedChoiceEvent) {
        this.setState({ idAddedChoiceEvent: addedChoice[0].id });
        console.log('NEW ADDED CHOICE EVENT OCCURED ', this.state.idAddedChoiceEvent, ' object size: ', addedChoice.length);
        console.log(addedChoice[0]);

        const choicesCount = await survey.methods.choicesCount().call();

        let i=1;
        let choices = [];
        while (i<=choicesCount) {
          let oneChoice = await survey.methods.choices(i).call();
          choices.push(oneChoice);
          i++;
        }
        this.setState({ choices, choicesCount });
        this.setState({ messageWarning: false, messageWarningText: '' });
      }
    }    
  }

  watchAddedQuestionEvent = async () => {
    const addedQuestion = await survey.getPastEvents('addedQuestionEvent');

    if (addedQuestion.length > 0) {
      if (addedQuestion[0].id !== this.state.idQuestionEvent) {
        this.setState({ idQuestionEvent: addedQuestion[0].id });
        console.log('NEW QUESTION EVENT OCCURED ', this.state.idQuestionEvent, ' object size: ', addedQuestion.length);
        console.log(addedQuestion[0]);

        const newQuestion = await survey.methods.surveyQuestion().call();
        this.setState({ surveyQuestion: newQuestion });

        this.setState({ messageWarning: false, messageWarningText: '' });
      }
    }    
  }

  watchDeletedEvent = async () => {
    const deletedEvent = await survey.getPastEvents('deletedEvent');

    if (deletedEvent.length > 0) {
      if (deletedEvent[0].id !== this.state.idDeletedEvent) {
        this.setState({ idDeletedEvent: deletedEvent[0].id });
        console.log('NEW DELETE CHOICE EVENT OCCURED ', this.state.idDeletedEvent, ' object size: ', deletedEvent.length);
        console.log(deletedEvent[0]);

        const choicesCount = await survey.methods.choicesCount().call();

        let i=1;
        let choices = [];
        while (i<=choicesCount) {
          let oneChoice = await survey.methods.choices(i).call();
          choices.push(oneChoice);
          i++;
        }
        this.setState({ choices, choicesCount });
        this.setState({ messageWarning: false, messageWarningText: '' });
      }
    }    
  }

  watchUndeletedEvent = async () => {
    const undeletedEvent = await survey.getPastEvents('undeletedEvent');

    if (undeletedEvent.length > 0) {
      if (undeletedEvent[0].id !== this.state.idUndeletedEvent) {
        this.setState({ idUndeletedEvent: undeletedEvent[0].id });
        console.log('NEW UNDELETE CHOICE EVENT OCCURED ', this.state.idUndeletedEvent, ' object size: ', undeletedEvent.length);
        console.log(undeletedEvent[0]);

        const choicesCount = await survey.methods.choicesCount().call();

        let i=1;
        let choices = [];
        while (i<=choicesCount) {
          let oneChoice = await survey.methods.choices(i).call();
          choices.push(oneChoice);
          i++;
        }
        this.setState({ choices, choicesCount });
        this.setState({ messageWarning: false, messageWarningText: '' });
      }
    }    
  }

  render() {
    
    this.listenForEvents();
    this.watchAddedChoiceEvent();
    this.watchVotedEvent();
    this.watchAddedQuestionEvent();
    this.watchDeletedEvent();
    this.watchUndeletedEvent();

    return (
      <div className="App">
        <h1>
          { this.state.surveyQuestion !== '' ?
            <span>{this.state.surveyQuestion}</span> :
            <span>Enter a survey question</span>
          }
          { this.state.accountIsManager ? 
            <button onClick={this.onButtonQuestionClick} type="button" className="btn">{this.textButtonQuestion()}</button> : 
            null
          }
        </h1>
        { this.state.enterNewQuestion ? <EnterText onSubmitNewQuestion={this.onSubmitNewQuestion} placeHolder="Enter new question" /> : null }

        <h4><strong>Survey Manager: </strong>{this.state.manager}</h4>
        { this.state.account === null ? 
          <p className="alert alert-danger class-80" role="alert"><strong>You are not logged on. </strong>Please enable MetaMask.</p> : 
          <p className="alert alert-info class-80" role="alert"><strong>You are log on the following account: </strong>{this.state.account}</p>
        }

        { this.state.messageWarning ?
          <h4 className="alert alert-warning class-80" role="alert">{this.state.messageWarningText}</h4> : 
          null
        }

        <h4 className="class-80">
          { this.state.choicesCount > 0 ? 
            <div className="alert alert-info"><strong>MAKE YOUR CHOICE</strong></div> : 
            <div className="alert alert-warning">No any choices for the time being</div> 
          }
        </h4>

        <div className="class-80">
          <table className="table">
            <thead>
             <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col" className="center-text">Votes</th>
                <th scope="col" className="center-text">Action</th>
              </tr>
            </thead>
            <tbody>
             { this.state.choices.map(item => {
                return (
                  <tr key={item.id}>
                    <ListItem
                      id={item.id}
                      name={item.name}
                      voteCount={item.voteCount}
                      deleted={item.deleted}
                      accountIsManager={this.state.accountIsManager}
                      handleVote={this.handleVote}
                      handleDelete={this.handleDelete}
                      handleUndelete={this.handleUndelete}
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        { this.state.accountIsManager ? 
            <button onClick={this.onButtonChoiceClick} type="button" className="btn">{this.textButtonChoice()}</button> : 
            null
        }
        { this.state.enterNewChoice ? 
          <EnterText onSubmitNewQuestion={this.onSubmitNewChoice} placeHolder="Enter new choice" /> : 
          null 
        }
      </div>
    );
  }
}

export default App;
