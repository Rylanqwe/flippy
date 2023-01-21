pragma solidity ^0.8.0;

contract CoinFlip {
    address payable public owner;
    mapping(address => uint) public balances;

    constructor() public {
        owner = msg.sender;
    }

    function flip() public payable {
        require(msg.value > 0.1 ether, "Minimum bet is 0.1 ether");

        if (uint8(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) < 128) {
            balances[msg.sender] += msg.value;
        } else {
            balances[msg.sender] -= msg.value;
        }
    }

    function withdraw() public {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        require(balances[owner] > 0, "There are no funds to withdraw");
        owner.transfer(balances[owner]);
        balances[owner] = 0;
    }

    function getBalance() public view returns (uint) {
        return balances[msg.sender];
    }
}
