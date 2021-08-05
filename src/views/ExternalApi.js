import React, { useState } from "react";
import { Button, Alert } from "reactstrap";
//import Highlight from "../components/Highlight"; // Este componente está roto.
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import axios from 'axios';

export const ExternalApiComponent = () => {
 const { apiOrigin = "https://g-poc-gateway.herokuapp.com", audience } = getConfig();
  // const { apiOrigin = "http://127.0.0.1:8181", audience } = getConfig();

  const [dataApi, setDataApi] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const {
    getAccessTokenSilently,
    getIdTokenClaims,
    loginWithPopup,
    getAccessTokenWithPopup,
  } = useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setDataApi({
        ...dataApi,
        error: null,
      });
    } catch (error) {
      setDataApi({
        ...dataApi,
        error: error.error,
      });
    }

    await callApiPrivate();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setDataApi({
        ...dataApi,
        error: null,
      });
    } catch (error) {
      setDataApi({
        ...dataApi,
        error: error.error,
      });
    }

    await callApiPrivate();
  };

  const callApiPrivate = async () => {
    try {

      const token = await getAccessTokenSilently();
      const idToken = await getIdTokenClaims();

      const {data: response} = await axios.get(`${apiOrigin}/api/private`, {
        headers: {
          Authorization: `Bearer ${token}`,
          IdToken: `${idToken}`,
        },
      });

      setDataApi({
        showResult: true,
        apiMessage: JSON.stringify(response, null, 2),
        error: null,
      });
    } catch (error) {
      setDataApi({
        showResult: false,
        apiMessage: '',
        error: error.error,
      });
    }
  };

  const callApiPublic = async () => {
    try {

      const token = await getAccessTokenSilently();
      const idToken = await getIdTokenClaims();

      const {data:response} = await axios.get(`${apiOrigin}/api/public`, {
        headers: {
          Authorization: `Bearer ${token}`,
          IdToken: `${idToken}`,
        },
      });

      setDataApi({
        showResult: true,
        apiMessage: JSON.stringify(response, null, 2),
        error: null
      });
    } catch (error) {
      setDataApi({
        showResult: false,
        apiMessage: '',
        error: error.error,
      });
    }
  };


  const callApiCreateInterrogation = async () => {
    try {

      const token = await getAccessTokenSilently();

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',  Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: 'React POST Request Example' })
      };

      // TODO we are gonna migrate this! :D
      const response = await fetch(`${apiOrigin}/api/user/interrogation`, requestOptions);

      const responseData = await response.json();

      setDataApi({
        showResult: true,
        apiMessage: responseData,
        error: null,
      });
    } catch (error) {
      setDataApi({
        showResult: false,
        apiMessage: '',
        error: error.error,
      });
    }
  };

  const callApiCreateUser = async () => {
    try {

      const token = await getAccessTokenSilently();

      const requestBody = {
        email: "messisefuedelbarza@test.com",
        connection: "Username-Password-Authentication",
        password: "password1.24Y",
        role: "admin"
      };
       

      const {data: response} = await axios.post(`${apiOrigin}/api/v0/users`, requestBody ,  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDataApi({
        showResult: true,
        apiMessage: JSON.stringify(response, null, 2),
        error: null,
      });
    } catch (error) {
      console.error('ERROR', error);
      setDataApi({
        showResult: false,
        apiMessage: '',
        error: error.error,
      });
    }
  };

  const callApiGetMetadata = async () => {
    try {

      const token = await getAccessTokenSilently();

      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',  Authorization: `Bearer ${token}` }
      };

      const response = await fetch(`${apiOrigin}/api/metadata`, requestOptions);

      const responseData = await response.json();

      setDataApi({
        ...dataApi,
        showResult: true,
        apiMessage: responseData,
      });
    } catch (error) {
      setDataApi({
        showResult: false,
        apiMessage: '',
        error: error.error,
      });
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  console.log(dataApi);

  return (
      <>
        <div className="mb-5">
          {dataApi.error === "consent_required" && (
              <Alert color="warning">
                You need to{" "}
                <a
                    href="#/"
                    class="alert-link"
                    onClick={(e) => handle(e, handleConsent)}
                >
                  consent to get access to users api
                </a>
              </Alert>
          )}

          {dataApi.error === "login_required" && (
              <Alert color="warning">
                You need to{" "}
                <a
                    href="#/"
                    class="alert-link"
                    onClick={(e) => handle(e, handleLoginAgain)}
                >
                  log in again
                </a>
              </Alert>
          )}

          <h1>External API</h1>
          <p className="lead">
            Ping an external API by clicking the button below.
          </p>

          <div>
            <Button
                color="primary"
                className="mt-5"
                onClick={callApiPrivate}
                disabled={!audience}
            >
              get private
            </Button>
          </div>

          <div>
            <Button
                color="primary"
                className="mt-5"
                onClick={callApiPublic}
                disabled={!audience}
            >
              get public
            </Button>
          </div>

          <div>
            <Button
                color="primary"
                className="mt-5"
                onClick={callApiCreateInterrogation}
                disabled={!audience}
            >
              Create Interrogation (user)
            </Button>
          </div>

          <div>
            <Button
                color="primary"
                className="mt-5"
                onClick={callApiCreateUser}
                disabled={!audience}
            >
              Create User (admin)
            </Button>
          </div>

          <div>
            <Button
                color="primary"
                className="mt-5"
                onClick={callApiGetMetadata}
                disabled={!audience}
            >
              Get User metadata
            </Button>
          </div>

        </div>

        <div className="result-block-container">
          {dataApi.showResult && (
              <div className="result-block" data-testid="api-result">
                <h6 className="muted">Result</h6>
                  <span>{dataApi.apiMessage}</span>
              </div>
          )
          }
          { 
            dataApi.error && (<div>Error => {dataApi.error}</div>)
          }
        </div>
      </>
  );
};

export default withAuthenticationRequired(ExternalApiComponent, {
  onRedirecting: () => <Loading />,
});
