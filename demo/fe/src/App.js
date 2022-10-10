import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup'
import 'bootstrap/dist/css/bootstrap.min.css';
import Dropdown from 'react-bootstrap/Dropdown';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import _ from 'lodash';


import JsonFormatter from 'react-json-formatter'
import DropdownItem from 'react-bootstrap/esm/DropdownItem';


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


async function get(resource, key) {
  const url = `${baseURL}/${resource}?key=${key}`
  const data = await fetch(url).then(
    res => res.json()).then( res => res[resource])
  console.log(data)
  return data
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
      <Row style={{border:'1px', borderStyle:'solid', margin:'2vw', padding:'1vw'}}>
        CID: {CID}
       </Row>
      <Row style={{border:'1px', borderStyle:'solid', margin:'2vw', padding:'1vw'}}>
        <Col  style={{margin:'2vw'}}>      
          <input value={trustedAddress} onChange={(e)=> setTrustedAddress(e.target.value)}></input>
        </Col>
        <Col  style={{margin:'2vw'}}>
          <Dropdown onSelect={(e) => {
            setSecurityLevel(e)
          }
            }>
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
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
          <DecryptionRequest privKey={props.privKey}/>
      <Row style={{border:'2px', borderStyle:'dotted', margin:'2vw'}}>
        <Customers privKey={props.privKey}/>
      </Row>
      <Row>
        <GetData privKey={props.privKey} />
      </Row>
      <Row>
        <ClearFunds privKey={props.privKey}/>
      </Row>
      </Card.Body>
    </Card>
    </>
   
  )
}

function DecryptionRequest(props) {
  const [requestedAddress, setRequestedAddress] = useState("")
  const [security, setSecurityLevel] = useState(0)
  const sendDecryptRequest = async () => {
    await post('request-decrypt', {key: props.privKey, locksmith: requestedAddress, tier:security})
    setRequestedAddress("")
  }

  return(
    <Row style={{border:'2px', borderStyle:'dotted', margin:'2vw'}}>
      <Col>
        <input value={requestedAddress} onChange={(e)=> setRequestedAddress(e.target.value)} style={{margin:'2vw'}}/>
      </Col>
      <Col>
      <Dropdown onSelect={(e) => {
            setSecurityLevel(e)
          }
            }>
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
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
        <Button style={{margin:'2vw'}} variant="primary" size='sm' onClick={()=>sendDecryptRequest()}>Request Decryption</Button>
      </Col>
    </Row>
  )
}

class AdapterModule extends React.Component {
  render() {
    return (
      <div>
        {this.props.items.map(item => (
          <DemoCard style={{padding: '2vw'}} key={item.text}  privKey={item.text}/>
        ))}
      </div>
    );
  }
}

function GetData(props) {
  const [locksmith, setLocksmith] = useState('')
  const [security, setSecurityLevel] = useState("T0")
  const [data, setData] = useState(null)
  const requestData = async() => {
    const data = await post('get-decrypted-relations', {key:props.privKey, locksmith: locksmith, tier: security})
    console.log(data)
    setData(data)
  }
  return (
    <div>
    <Row style={{border:'2px', borderStyle:'dotted', margin:'2vw'}}>
      <Col>
        <input value={locksmith} onChange={(e)=> setLocksmith(e.target.value)} style={{margin:'2vw'}}/>
      </Col>
      <Col>
      <Dropdown onSelect={(e) => {
            setSecurityLevel(e)
          }
            }>
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
              {security}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="T0">T0 - Unencrypted</Dropdown.Item>
              <Dropdown.Item eventKey="T1">T1 - Encrypted</Dropdown.Item>
              <Dropdown.Item eventKey="T2">T2 - Encrypted</Dropdown.Item>
              <Dropdown.Item eventKey="T3">T3 - Encrypted</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
      </Col>
      <Col>
        <Button style={{margin:'2vw'}} variant="primary" size='sm' onClick={()=>requestData()}>Get Data</Button>
      </Col>
    </Row>
    <Row>
      {data !== null && 
      <Card.Text>
        {JSON.stringify(data)}
      </Card.Text>
      }
    </Row>
    </div>
  )
}

function Customers(props) {
  const [customerList, setCustomerList] = useState([])
  const [selected, setSelected] = useState(["Choose a Customer"])

  const fetchCustomerList = async() => {
    const customers = await get('customers', props.privKey)
    var list = customers.map(x=> {
      const entry = new Object();
      entry.address = x[0]
      entry.tier = x[1]
      return entry    
    })
    console.log(list)
    setCustomerList(_.uniqBy(list, 'address'))
  }
  const approve = async() => {
    await post('approve-request', {key: props.privKey, customer: selected.split(',')[0]})

    setSelected("Choose a Customer")
  }

  return(
    <div style={{margin:'2vw'}}>
      <Row>
      <Col>
      <Button variant='outline-secondary' onClick={()=>fetchCustomerList()} >Refresh List</Button>
      </Col>
      <Col>
        <Dropdown onSelect={(e) => setSelected(e)}>
        <Dropdown.Toggle variant="dark" id="dropdown-basic-2">
                  {selected}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {customerList.map( c => (
                <Dropdown.Item key={c.address} eventKey={[c.address, c.tier]}>Address: {c.address} Tier: {c.tier}</Dropdown.Item>
              ))}
          </Dropdown.Menu>
      </Dropdown>
      </Col>
     <Col>
     <Button onClick={()=>{approve()}}>Approve</Button>
     </Col>

     </Row>
    </div>
  )

}


function ClearFunds(props) {
  const [customerList, setCustomerList] = useState([])
  const [selected, setSelected] = useState(["Choose a Customer"])

  const fetchCustomerList = async() => {
    const customers = await get('customers', props.privKey)
    var list = customers.map(x=> {
      const entry = new Object();
      entry.address = x[0]
      entry.tier = x[1]
      return entry    
    })
    console.log(list)
    setCustomerList(_.uniqBy(list, 'address'))
  }
  const clear = async() => {
    await post('clear-funds', {key: props.privKey, customer: selected.split(',')[0]})

    setSelected("Choose a Customer")
  }

  return(
    <div style={{margin:'2vw'}}>
      <Row>
      <Col>
      <Button variant='outline-secondary' onClick={()=>fetchCustomerList()} >Refresh List</Button>
      </Col>
      <Col>
        <Dropdown onSelect={(e) => setSelected(e)}>
        <Dropdown.Toggle variant="dark" id="dropdown-basic-2">
                  {selected}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {customerList.map( c => (
                <Dropdown.Item key={c.address} eventKey={[c.address, c.tier]}>Address: {c.address} Tier: {c.tier}</Dropdown.Item>
              ))}
          </Dropdown.Menu>
      </Dropdown>
      </Col>
     <Col>
     <Button onClick={()=>{clear()}}>Clear Funds</Button>
     </Col>

     </Row>
    </div>
  )

}


function CIDSearch() {
  const [CID, setCID] = useState("")
  const [payload, setPayload] = useState(`{empty:0}`)
  const updatePayload = async() => {
    const url = `${baseURL}/cid?cid=${CID}`
    const value = await fetch(url).then(res => res.json())
    console.log(value)
    setPayload(value.payload)
  }

  return(
    <Card style ={{marginLeft:'20vw', width:'60vw', marginTop:'2vh'}}>
    <Card.Title>Search CID Value</Card.Title>
    <Card.Body>
      <Row>
      <input value={CID} onChange={(e) => setCID(e.target.value)}></input>
      <Button variant="dark" size='sm' style={{marginLeft:'1vw'}} onClick={()=>updatePayload()}>Search CID</Button>
      </Row>
      <Row>
        <Card.Text>
          <ListGroup>
            <ListGroup.Item>T0: {JSON.stringify(payload.T0)}</ListGroup.Item>
            <ListGroup.Item>T1: {JSON.stringify(payload.T1)}</ListGroup.Item>
            <ListGroup.Item>T2: {JSON.stringify(payload.T2)}</ListGroup.Item>
            <ListGroup.Item>T3: {JSON.stringify(payload.T3)}</ListGroup.Item>
          </ListGroup>
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
