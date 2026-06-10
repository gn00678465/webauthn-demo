import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Collapse,
  Card,
  CardContent,
  Modal
} from "@mui/material";
import { useNavigate, useLoaderData, Link } from "react-router-dom";
import { isLocalAuthenticator } from "@webauthn/browser";
import { AdvanceOptionsContextProvider } from "./store";
import {
  Registration,
  Authentication,
  AdvanceContext,
  PasskeyEndpointsCard
} from "./components";

import {
  useRegistration,
  usePassKeys,
  useAuthentication,
  useBoolean,
  useRegistrationAdvance,
  useAuthenticationAdvance
} from "./hooks";

export default function WebAuthnContext() {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const navigate = useNavigate();
  const loaderData = useLoaderData() as "login" | "enroll";
  const { bool, setTrue, setFalse } = useBoolean();
  const { bool: showAdv, setBool: setShowAdv } = useBoolean(false);
  const [registerAdvOpts, dispatchRegisterAdvOpts] = useRegistrationAdvance();
  const [authAdvOpts, dispatchAuthAdvOpts] = useAuthenticationAdvance();

  useEffect(() => {
    async function getAvailable(): Promise<void> {
      try {
        const res = await isLocalAuthenticator();
        setIsAvailable(res);
      } catch (err) {
        setIsAvailable(false);
      }
    }

    getAvailable();
  }, []);

  const { handleRegistration } = useRegistration<{ status: "Success" }>({
    params: registerAdvOpts,
    onSuccess: (args) => {
      if (args?.status === "Success") {
        navigate("/passkeys");
      }
    },
    onComplete() {},
    onError(error) {
      if (error instanceof Error) {
        if (error.name === "InvalidStateError") {
          console.error("InvalidStateError", error.name);
        }
        if (error.name === "NotAllowedError") {
          setTrue();
        }
      }
      console.error(error);
    }
  });

  const { handleAuthentication } = useAuthentication<{ status: "Success" }>({
    params: authAdvOpts,
    onSuccess: (args) => {
      if (args?.status === "Success") {
        navigate("/passkeys");
      }
    },
    onComplete() {},
    onError(error) {
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setTrue();
        }
      }
      console.error(error);
    }
  });

  const { handlePasskeys } = usePassKeys<{ status: "Success" }>({
    params: authAdvOpts,
    onSuccess: (args) => {
      if (args?.status === "Success") {
        navigate("/passkeys");
      }
    },
    onComplete() {},
    onError(error) {
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setTrue();
        }
      }
      console.error(error);
    }
  });

  function handleChange(_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) {
    setShowAdv(checked);
  }

  function capitalizeCase(str: string): string {
    return str.slice(0, 1).toUpperCase() + str.slice(1, str.length);
  }

  return (
    <>
      <Box
        maxWidth={600}
        sx={{ display: "inline-block", width: "100%" }}
      >
        <Card
          className="vault-rise vault-rise-2"
          variant="outlined"
          sx={{ borderRadius: 3 }}
        >
          <CardContent>
            {loaderData === "login" && (
              <Authentication
                key={loaderData + "_" + "field"}
                isAvailable={isAvailable}
                onAuthentication={handleAuthentication}
                onPasskeys={handlePasskeys}
              >
                <Typography
                  variant="h4"
                  mb={1}
                  sx={{ fontWeight: 500, fontSize: { xs: "1.875rem", sm: "2.125rem" } }}
                >
                  {capitalizeCase(loaderData)}
                </Typography>
              </Authentication>
            )}
            {loaderData === "enroll" && (
              <Registration
                key={loaderData + "_" + "field"}
                isAvailable={isAvailable}
                onRegistration={handleRegistration}
              >
                <Typography
                  variant="h4"
                  mb={1}
                  sx={{ fontWeight: 500, fontSize: { xs: "1.875rem", sm: "2.125rem" } }}
                >
                  Create a passkey
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={1}
                >
                  此頁面即 /.well-known/passkey-endpoints 廣告的 enroll 端點
                </Typography>
              </Registration>
            )}
          </CardContent>
        </Card>
        <Box
          className="vault-rise vault-rise-3"
          sx={{ mt: 3, width: "auto", textAlign: "left" }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={showAdv}
                onChange={handleChange}
              />
            }
            label="Advance"
          />
          <Collapse in={showAdv}>
            <AdvanceOptionsContextProvider
              registerAdvOpts={registerAdvOpts}
              dispatchRegisterAdvOpts={dispatchRegisterAdvOpts}
              authAdvOpts={authAdvOpts}
              dispatchAuthAdvOpts={dispatchAuthAdvOpts}
            >
              <AdvanceContext></AdvanceContext>
            </AdvanceOptionsContextProvider>
          </Collapse>
        </Box>
        <PasskeyEndpointsCard />
      </Box>
      <Modal
        open={bool}
        onClose={setFalse}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4
          }}
        >
          <Typography>
            The operation either timed out or was not allowed. See:
            <Link
              target="_blank"
              style={{ color: "#7FB4FF" }}
              to="https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client."
            >
              https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.
            </Link>
          </Typography>
        </Box>
      </Modal>
    </>
  );
}
