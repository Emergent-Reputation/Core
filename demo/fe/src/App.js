import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dropdown from 'react-bootstrap/Dropdown';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const baseURL = 'https://ckartik.ngrok.io';

class DemoApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: [], text: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <div>
        <h3>Emergent Reputation Demo</h3>
        <AdapterModule items={this.state.items} />
        <div>
          <label style={{marginRight:'1vw'}}>
            Private Key:
          </label>
          <input
            id="new-todo"
            onChange={this.handleChange}
            value={this.state.text}
          />
          <Button style={{marginLeft:'1vw'}} variant='dark' onClick={this.handleSubmit} size='sm'>
            Add Demo Modal #{this.state.items.length + 1}
          </Button>
          <CIDSearch/>
        </div>
      </div>
    );
  }

  handleChange(e) {
    this.setState({ text: e.target.value });
  }



  handleSubmit(e) {
    e.preventDefault();
    if (this.state.text.length === 0) {
      return;
    }
    const newItem = {
      text: this.state.text,
      id: Date.now()
    };
    
    this.setState(state => ({
      items: state.items.concat(newItem),
      text: ''
    }));
  }
}


async function get(resource, key, queryName='key') {
  const url = `${baseURL}/${resource}?${queryName}=${key}`
  return fetch(url).then(
    res => res.json()).then( res => res[resource])
}

async function post(resource, body) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(body),
    redirect: 'follow'
  };

  return fetch(`${baseURL}/${resource}`, requestOptions)
    .then(response => response.json());
}
function DemoCard(props) {
  const [address, setAddress] = useState(null)
  const [security, setSecurityLevel] = useState("0")
  const [trustedAddress, setTrustedAddress] = useState("")
  const [CID, setCID] = useState("")
  useEffect( () => {
    async function getAddress() {
      const address = await get('address', props.privKey)
      setAddress(address)
    }
    getAddress();
  },[])
  const updateCID = async() => {
    const res =await post('relation', {key: props.privKey, value: trustedAddress, tier: parseInt(security)})
    setCID(res.cid)
  }
  return (
    <>
    <Card bg="light" border="dark" text="dark" style={{ width: '90vw', margin: '5vw' }}>
      <Card.Body>
      <Card.Title>Address: {address}</Card.Title>
      <Row>
        CID: {CID}
       </Row>
      <Row>
        <Col>      
          <input value={trustedAddress} onChange={(e)=> setTrustedAddress(e.target.value)}></input>
        </Col>
        <Col>
          <Dropdown onSelect={(e) => {
            setSecurityLevel(e)
          }
            }>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              {security}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="0">T0 - Unencrypted</Dropdown.Item>
              <Dropdown.Item eventKey="1">T1 - Encrypted</Dropdown.Item>
              <Dropdown.Item eventKey="2">T2 - Encrypted</Dropdown.Item>
              <Dropdown.Item eventKey="3">T3 - Encrypted</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col>
        <Button variant="primary" onClick={() => updateCID()}>Add Trust Relation</Button>
        </Col>
      </Row>
      
      </Card.Body>
    </Card>
    </>
   
  )
}

class AdapterModule extends React.Component {
  render() {
    return (
      <div>
        {this.props.items.map(item => (
          <DemoCard privKey={item.text}/>
        ))}
      </div>
    );
  }
}

function CIDSearch() {
  const [CID, setCID] = useState("")
  const [payload, setPayload] = useState(" ")
  const updatePayload = async() => {
    const url = `${baseURL}/cid?cid=${CID}`
    const value = await fetch(url).then(res => res.json())
    // console.log(value)
    setPayload(value.payload)
  }

  return(
    <Card style ={{margin:'1vw'}}>
    <Card.Title>Search CID Value</Card.Title>
    <Card.Body>
      <Row>
      <input value={CID} onChange={(e) => setCID(e.target.value)}></input>
      <Button variant="dark" size='sm' style={{marginLeft:'1vw'}} onClick={()=>updatePayload()}>Search CID</Button>
      </Row>
      <Row>
        <Card.Text>
        {payload}
        </Card.Text>
      </Row>
    </Card.Body>
  </Card>
  )
}
function App() {

  const [address, setAddress] = React.useState(null);

  return (
    <div className="App">
      <DemoApp/>
    </div>
  );
}

export default App;
