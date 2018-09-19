import React, { Component } from 'react';

class EnterText extends Component {

	state = { inputText: '' }

	//type new text
  onInputText(event) {
    this.setState({ inputText: event.target.value });
  }

	//pass text to the calling component
	onSubmitText(event) {
		event.preventDefault();
		this.props.onSubmitNewQuestion(this.state.inputText);
		this.setState({ inputText: '' });
	}
	
  render() { 
    return ( 
			<div>
				<form onSubmit={this.onSubmitText.bind(this)}>
					<div>
						<input 
							type="text"
							placeholder={this.props.placeHolder}
							value={this.state.inputText}
							onChange={this.onInputText.bind(this)}
						/>
					</div>
        </form>
			</div>
    );
  }
}
 
export default EnterText;