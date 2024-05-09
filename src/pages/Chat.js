import React, { useEffect, useState } from 'react'
import greenBubble from '../images/greenbubble.png'
import grayBubble from '../images/graybubble.png'
import background from '../images/background.png'
import Header from '../components/Header'
import { getFirestore, doc, getDoc, collection, addDoc, query, getDocs, } from 'firebase/firestore';
import { app } from '../Firebase';

function Chat() {
    const db = getFirestore(app);
    const [currentMessage, setCurrentMessage] = useState('')
    const [conversation,setConversation] = useState([])
    const [serverResponse, setServerResponse] = useState('')
    const [waitingResponse, setWaitingResponse] = useState(false)
    const [documents, setDocuments] = useState([])
    const [selectedDocs, setSelectedDocs] = useState([])
    const [overlay, setOverlay] = useState(false)
    const [docToEdit, setDocToEdit] = useState([])
    const [answerLength, setAnswerLength] = useState(0); 
    const [writtingStyle, setWrittingStyle] = useState(0)
    const [textToInclude, setTextToInclude] = useState([])
    const [prompt, setPrompt] = useState('')

    const openAiUrl = process.env.REACT_APP_APIURL;
    useEffect(()=>{
      getDocuments()
    },[])

    useEffect(()=>{
        // console.log(conversation);
        const bubblesElement = document.getElementById('bubbles');
        if (bubblesElement) {
            // Scroll to the bottom of the bubbles element
            bubblesElement.scrollTop = bubblesElement.scrollHeight;
        }
    },[conversation])

    useEffect(()=>{
        if(serverResponse !== ''){
            addMessage('server', serverResponse)   
        }
    },[serverResponse])

    useEffect(() => {
      let strAnswerLength;
      let strWrittingStyle;
      
    
      switch (answerLength) {
        case 1:
          strAnswerLength = 'Provide a concise and short response';
          break;
        case 2:
          strAnswerLength = 'Offer a moderate level of detail medium length';
          break;
        case 3:
          strAnswerLength = 'Include a comprehensive and detailed answer';
          break;
        default:
          strAnswerLength = '';
          break;
      }
    
      switch (writtingStyle) {
        case 1:
          strWrittingStyle = 'For professional and structured responses';
          break;
        case 2:
          strWrittingStyle = 'For compelling and convincing arguments';
          break;
        case 3:
          strWrittingStyle = 'For relaxed and informal communication';
          break;
        default:
          strWrittingStyle = '';
          break;
      }
       
      console.log(textToInclude.length);
      let prompt = currentMessage + ' ' + strAnswerLength + ' ' + strWrittingStyle + (textToInclude.length > 0 ? ' with the following information: ' + textToInclude.join(' ') : '');
      console.log(prompt);
      setPrompt(prompt);
    
    }, [textToInclude, answerLength, writtingStyle, currentMessage]);
    

    function getTimeStamp(){
        const timestamp = new Date();
        const date = timestamp.toLocaleDateString();
        const time = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${date}|${time}`;
    }

    const addMessage = (sender, text) => {
        const newMessage = {
          sender: sender,
          timestamp: getTimeStamp(),
          text: text
        };
        setConversation([...conversation, newMessage]);
        setCurrentMessage('')
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey && currentMessage !== '') {
          event.preventDefault(); // Prevent new line (unless Shift is pressed)
         newUserMessage()
        }
    };
    
    function newUserMessage(){
        sendRequest()
        addMessage('user', currentMessage); // Add the message
        setCurrentMessage(''); // Clear the current message
    }

    async function sendRequest(){
        setWaitingResponse(true)
        try {
            const response = await fetch(openAiUrl + '/generate-text', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt: prompt })
            });
      
            if (!response.ok) {
              throw new Error('Failed to generate text');
            }
      
            const data = await response.json();
            setServerResponse(data)
            setWaitingResponse(false)
          } catch (error) {
            console.error('Error generating text:', error);
          }
    }

    async function getDocuments() {
      const q = query(collection(db, "Documents"));
      const querySnapshot = await getDocs(q);
      let i = 1;
      const newDocuments = [];
      querySnapshot.forEach((doc) => {
          const newDoc = {
              id: i,
              title: doc.id,
              content: doc.data().content,
          };
          newDocuments.push(newDoc);
          i++;
      });
      setDocuments([...documents, ...newDocuments]);
    }

    function onDocSelect(id, content) {
      const index = selectedDocs.indexOf(id);
      if (index !== -1) {
        // Document is already selected, so remove it
        setSelectedDocs(selectedDocs.filter(docId => docId !== id));
        setTextToInclude(textToInclude.filter(item => item !== content));
      } else {
        // Document is not selected, so add it
        setSelectedDocs([...selectedDocs, id]);
        setTextToInclude([...textToInclude, content]);
      }
    }
    

    function onEditDoc(id){
    setOverlay(true)
    setDocToEdit(documents[id-1])
    }

  

  
      

  return (
    <div className='chat-page'>
      <Header />
      <img src={background} className='background'/> 
      
      <div className='sidebar'>
        <div className='title'>
          <i className="bi bi-sliders"></i>
          <p> Configurations </p>
        </div>
        <div className='section'>
          <p className='subTitle'> Answer Lenght: </p>
          <div className='btns'>
            <button onClick={() => setAnswerLength(1)} className={answerLength === 1 ? "selectedOption" : ""}>Small</button>
            <button onClick={() => setAnswerLength(2)} className={answerLength === 2 ? "selectedOption" : ""}>Medium</button>
            <button onClick={() => setAnswerLength(3)} className={answerLength === 3 ? "selectedOption" : ""}>Large</button>
          </div>
        </div>
        <div className='section'>
          <p className='subTitle'> Writting Style:</p>
          <div className='btns'>
            <button onClick={()=> setWrittingStyle(1)} className={writtingStyle === 1? "selectedOption":""}> Formal </button>
            <button onClick={()=> setWrittingStyle(2)} className={writtingStyle === 2? "selectedOption":""}> Persuasive </button>
            <button onClick={()=> setWrittingStyle(3)} className={writtingStyle === 3? "selectedOption":""}> Casual </button>
          </div>
        </div>
        {documents.map((document) => (
          <div className='section'>
            <div className='document-section'>
              <i className={selectedDocs.includes(document.id) ? "bi bi-check-circle-fill iconChecked" : "bi bi-check-circle-fill iconCheck"} onClick={()=>onDocSelect(document.id, document.content)}></i>
              <p> {document.title}</p>
              <i className="bi bi-pencil-square iconEdit" onClick={()=>onEditDoc(document.id)}></i>
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className='bubbles' id="bubbles">
          {conversation.map((message, index) => (
              <div className='row' key={index}>
                <div className={message.sender == 'user' ?'user-bubble':'server-bubble'}>
                {message.text.split('\n').map((textPart, idx) => (
                    <React.Fragment key={idx}>
                      {textPart}
                      <br></br>
                    </React.Fragment>
                  ))}
                  <p className={message.sender === 'user' ? 'user-time-delivery' : 'server-time-delivery'}>{message.timestamp.split('|')[1]}</p>
                </div>
                <img src={message.sender === 'user' ? greenBubble : grayBubble} className={message.sender == 'user' ?'user-tail':'server-tail'}/>
              </div>
            ))}
            <div className='waiting' style={{display: waitingResponse ? "block":"none"}}>
              <div className='writting'>
                <i className="bi bi-circle-fill circle"></i>
                <i className="bi bi-circle-fill circle"></i>
                <i className="bi bi-circle-fill circle"></i>
              </div>
              <img src={grayBubble} className='server-tail'/>
            </div>

        </div>
        <div className='input-area'>
          <div className='container'>
              <div id="txt">
                  <textarea onChange={(e)=>setCurrentMessage(e.target.value)} onKeyDown={handleKeyDown} value={currentMessage} placeholder='Ask me something ...'/>
              </div>
              <div id="sbmt">
              <i className="bi bi-arrow-up-circle-fill iconBtnSbmt" onClick={() => currentMessage !== '' && newUserMessage()}></i>
              </div>
          </div>
        </div>
      </div>
      <div className='document-popup' style={{display: overlay ? "block":"none"}}>
        <p className='title'>{docToEdit.title} </p>
        <textarea value={docToEdit.content} />
        <div className='btns'>
          <button id="save"> Save </button>
          <button id="cancel"> Cancel </button>
        </div>
      </div>
      <div className='overlay' onClick={()=>setOverlay(!overlay)} style={{display: overlay ? "block":"none"}}/>
    </div>
  )
}

export default Chat
