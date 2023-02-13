import { Center, Loader } from "@mantine/core";

import AccountForm from "./AccountForm";

export default function Account(props) {
  return (
    <>
      {props.loading === true ? (
        <Center style={{ height: 500 }}>
          <Loader />
        </Center>
      ) : (
        <>
          <h1 style={{ textAlign: "center" }}>My Account</h1>
          <hr />
          <AccountForm
            userName={props.userName}
            setUserName={props.setUserName}
            userNusnetId={props.userNusnetId}
            setUserNusnetId={props.setUserNusnetId}
            userImage={props.userImage}
            setUserImage={props.setUserImage}
          />
        </>
      )}
    </>
  );
}
