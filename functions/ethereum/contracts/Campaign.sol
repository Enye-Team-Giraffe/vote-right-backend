pragma solidity ^0.4.17;

// define a new factory which would be responsibel for deploying a new instance
// of an election
contract ElectionFactory{
    address[] public deployedElections;
    
    function createElection() public {
        address newElection = new Election(msg.sender);
        deployedElections.push(newElection);
    }
    
    function getDeployedElections() public view returns(address[]){
        return deployedElections;
    }
}





// define a  function/contract which is reponsible for handling each election, this of course includes its candidates and results.
contract Election {
    
    ///////////////////////////////////////////////// initialise the variables and structs we are to use duting the election ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // an election consists of two characteristics,
    // the candidates and the voters, 
    // and we need to create a proper representation
    
    // this defines what properties a voter should look like.
    struct Voter {
        uint age;   // Age of the candidate
        string gender; // the gender of the voter
        string latlong;  // the latitude and longitude of the vote  lat_long
        string votedCandidate; // person delegated to
    }
    
    // this defines what a candidate should  like
    struct Candidate{
        string id; //generated id for this candidate
        string name; // the name of the candidate
        uint age; //age of this candidate
        string party; //the party of this candidate
        string quote; //the quote of each candidate
        string pictureLink; //the link of the picture to be posted
        string education; //the highest certificate of said candidate
        int voteCount;
    }
    
    // create a mapping to keep track of the candidate who have voted
    mapping(string=>bool) voted;
    mapping(string=>uint) indexes;
    
    // create an array to keep track of all the candidates we have
    Candidate[] public candidates;
    
    // create an array to keep track of all the people who have voted
    Voter[] public voters;
    
    // create a variable which keeps track of the current state of the election
    // it could either by 1 for initialised ,2 for started or 3 for ended
    int public electionState;
    
    // create a function to keep track of the manager of this election
    address public manager;
    
    //create a modifier which is going to secure certain functions 
    // so that they can only be run be the manager of the contract
    modifier restricted(){
        require(msg.sender == manager);
        _;
    }
    
    // create a function to initialise the election
    // this serves as a constrictor for this contract, and assigns a manager to this contract
    // also initialise the contract
    function Election(address creator) public{
        manager=creator ;
        electionState=1;
    }
    
    // first thing to do in an election is to create add to the array of candidates
    function addCandidate( string id, string name, uint age, string party,string quote, string pictureLink,string education ) public restricted{
        // make sure that the current state of the election is initialised
        require(electionState == 1 );
         Candidate memory  newCandidate = Candidate({
            id:id,
            name:name,
            age:age,
            party:party,
            quote:quote,
            pictureLink:pictureLink,
            education:education,
            voteCount:0
        });
        
        // create a mapping of generated clientId to the index it is stored in the array
        indexes[id]=candidates.length;
        candidates.push(newCandidate);
        
    }
    
    // after adding enough candidates, the next thing to do would be to change the state of the election to started
    // so that the voting can begin
    function concludeInitialisation() public{
        electionState = 2;
    }
    
           
    // after done adding candidates, next thing is to begin voting
    // everytime they vote add info about the voter
    function vote(string candidateId, uint age,string gender,string latlong,string phoneNumber) public {
        // election must have started and must not have finished
        require( electionState == 2);
        
        // also to confirm that this particular person has not voted more than once.
        require( !voted[phoneNumber] );
        
        // retrive the index the item is stored on the array
        uint index = indexes[candidateId];
        
        // retrieve this candidate from it's array
        Candidate storage candidate = candidates[index];
        
        // increase the vote count on this candidate
        candidate.voteCount++;
        // store basic information about each voter
        
        
        // store the information abou this voter
        Voter memory  newVoter = Voter({
            age:age,
            gender:gender,
            latlong:latlong,
            votedCandidate:candidateId
        });
        
        // add this person to the array of voters we currently have
        voters.push(newVoter);
        // record that this person has already voted
        voted[phoneNumber]=true;
        
    }
    
    // after adding enough votes, the next thing to do would be to change the state of the election to concluded
    // so that the counting scores can begin and voting can end
    function concludeVoting() public{
        electionState = 3;
    }
    
    
    
    ////////////////////////////////////////////////////////////////// utility functions //////////////////////////////////////////////////////////////////////////
    
    // function to get the length of the candidates
    function getCandidatesLength() public view returns (uint){
        return candidates.length;
    }
    
    // function to get the current timestamp
    function getTime() public view returns (uint){
        return now;
    }
    
}