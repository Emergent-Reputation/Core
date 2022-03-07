
## TDOO
@jialinli98 - Write out two functions in Javascript:

### Base Javascript
```javascript
    {
        "identity": "0x0000",
        "in_signatures": ["baf0023e1", "baf0023e2", "baf0023e3"],
        "in_pub_keys": ["key1", "key2", "key3"],
        "out_signatures": ["baf0023e1", "baf0023e2"]
    }
```

### Two functions:
1. Will alter out-signatures.
```javascript
    {
        "identity": "0x0000",
        "in_signatures": ["baf0023e1", "baf0023e2", "baf0023e3"],
        "in_pub_keys": ["key1", "key2", "key3"],
        "out_signatures": ["baf0023e1", "baf0023e2", "baf0023e3"] // 0x0000 signs anothers pub key
    }
```

2. Will alter in-signatures & public-key list.
```javascript
    {
        "identity": "0x0000",
        "in_signatures": ["baf0023e1", "baf0023e2", "baf0023e3",  "baf0023e4"], // 0x0000 has their pub key signed by key4.
        "in_pub_keys": ["key1", "key2", "key3", "Key4"],
        "out_signatures": ["baf0023e1", "baf0023e2"]
    }
```
#### TODO: Add a verification function f(pubKey, signature) -> bool