import { useState, useRef, useEffect } from "react"; // new
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { css } from "@emotion/css";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";

/* import contract address and contract owner address */
import { contractAddress } from "../config";

import FIR from "../artifacts/contracts/FIR.sol/FIR.json";

/* define the ipfs endpoint */
const client = create("https://ipfs.infura.io:5001/api/v0");

/* configure the markdown editor to be client-side import */
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const content = `**Personal Details**

1.  **Name** - 
2.  **Father's / Husband's Name** -
3.  **Address** - 
4.  **Phone number** - 

**Place of Occurrence**
			
1. **Distance from the police station** - 
2.  **Direction from the police station** - 

**Offence**
			
1. **Nature of the offence** (e.g. murder, theft etc.) - 
2. **Section** - 
3. **Description of the accused** -
4. **Details of witnesses** - 
5. **Complaint**: Briefly lay down the facts regarding the incident reported in an accurate way - 
`;

const initialState = { title: "", content: content };

function CreateComplaint() {
  /* configure initial state to be used in the component */
  const [Complaint, setComplaint] = useState(initialState);
  const [image, setImage] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const fileRef = useRef(null);
  const { title, content } = Complaint;
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      /* delay rendering buttons until dynamic import is complete */
      setLoaded(true);
    }, 500);
  }, []);

  function onChange(e) {
    setComplaint(() => ({ ...Complaint, [e.target.name]: e.target.value }));
  }

  async function createNewComplaint() {
    /* saves Complaint to ipfs then anchors to smart contract */
    if (!title || !content) return;
    const hash = await saveComplaintToIpfs();
    await saveComplaint(hash);
    router.push(`/`);
  }

  async function saveComplaintToIpfs() {
    /* save Complaint metadata to ipfs */
    try {
      const added = await client.add(JSON.stringify(Complaint));
      return added.path;
    } catch (err) {
      console.log("error: ", err);
    }
  }

  async function saveComplaint(hash) {
    /* anchor Complaint to smart contract */
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, FIR.abi, signer);
      console.log("contract: ", contract);
      try {
        const val = await contract.createComplaint(Complaint.title, hash);
        /* optional - wait for transaction to be confirmed before rerouting */
        /* await provider.waitForTransaction(val.hash) */
        console.log("val: ", val);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  function triggerOnChange() {
    /* trigger handleFileChange handler of hidden file input */
    fileRef.current.click();
  }

  async function handleFileChange(e) {
    /* upload cover image to ipfs and save hash to state */
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    const added = await client.add(uploadedFile);
    setComplaint((state) => ({ ...state, coverImage: added.path }));
    setImage(uploadedFile);
  }

  return (
    <div className={container}>
      {image && (
        <img className={coverImageStyle} src={URL.createObjectURL(image)} />
      )}
      <input
        onChange={onChange}
        name="title"
        placeholder="Complaint title"
        value={Complaint.title}
        className={titleStyle}
      />
      <SimpleMDE
        className={mdEditor}
        placeholder="Complaint details"
        value={Complaint.content}
        onChange={(value) => setComplaint({ ...Complaint, content: value })}
      />
      {loaded && (
        <>
          <button className={button} type="button" onClick={createNewComplaint}>
            File Complaint
          </button>
          <button onClick={triggerOnChange} className={button}>
            Add image
          </button>
        </>
      )}
      <input
        id="selectImage"
        className={hiddenInput}
        type="file"
        onChange={handleFileChange}
        ref={fileRef}
      />
    </div>
  );
}

const hiddenInput = css`
  display: none;
`;

const coverImageStyle = css`
  max-width: 800px;
`;

const mdEditor = css`
  margin-top: 40px;
`;

const titleStyle = css`
  margin-top: 40px;
  border: none;
  outline: none;
  background-color: inherit;
  font-size: 44px;
  font-weight: 600;
  &::placeholder {
    color: #999999;
  }
`;

const container = css`
  width: 800px;
  margin: 0 auto;
`;

const button = css`
  background-color: #fafafa;
  outline: none;
  border: 2px solid #000;
  font-size: 18px;
  padding: 16px 70px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 1px 1px rgba(0, 0, 0, 0.1);
`;

export default CreateComplaint;
