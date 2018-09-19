import React, { Component } from 'react';

class ListItem extends Component {

  state = {  }
 
  renderRowDeleted = () => {
    return (
      <React.Fragment>
        <td className="text-danger">{this.props.id}</td>
        <td className="text-danger">{this.props.name}</td>
        <td className="center-text text-danger">{this.props.voteCount}</td>
        <td className="center-text">
          <button type="button"
            className="btn btn-warning btn-sm"
            onClick={() => this.props.handleUndelete(this.props.id)} >undelete
          </button>
        </td>
      </React.Fragment>
    )
  }

  renderRowStandard = () => {
    return (
      <React.Fragment>        
        <td>{this.props.id}</td>
        <td>{this.props.name}</td>
        <td className="center-text">{this.props.voteCount}</td>
        <td className="center-text">
          <button type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => this.props.handleVote(this.props.id)} >vote
          </button>
          { this.props.accountIsManager === true ?
            <button type="button"
              className="btn btn-danger btn-sm"
              onClick={() => this.props.handleDelete(this.props.id)} >delete
            </button> :
            null
          }
        </td>
      </React.Fragment>
    )
  }

  renderRow = () => {
    return (this.props.deleted === true ? this.renderRowDeleted() : this.renderRowStandard());
  }

  render() { 
    return (
      <React.Fragment>
        { (this.props.id !== undefined) && ((this.props.deleted === false) || (this.props.deleted === true && this.props.accountIsManager === true)) ? this.renderRow() : null }
      </React.Fragment>
    );
  }
}
 
export default ListItem;