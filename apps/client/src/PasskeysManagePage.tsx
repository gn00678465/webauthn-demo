import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Stack,
  IconButton,
  CircularProgress
} from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useNavigate } from "react-router-dom";
import { authLogout } from "./service/auth";
import { getCredentials, deleteCredential, type CredentialInfo } from "./service/credentials";
import { Passkeys, Trash } from "./utils";
import { useBoolean } from "./hooks";
import { PasskeyEndpointsCard } from "./components";
import { fonts } from "./theme";

/**
 * Passkey 管理頁 — /.well-known/passkey-endpoints 的 manage 端點（/passkeys）。
 */
export function PasskeysManagePage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<CredentialInfo[]>([]);
  const { bool: loading, setTrue: loadingStart, setFalse: loadingStop } = useBoolean(false);

  async function deleCredential(id: string) {
    try {
      loadingStart();
      const res = await deleteCredential(id);
      if (res.data.status === "Success") {
        setCredentials(res.data.data);
      }
      if (res.data.status === "Error") {
        console.error(new Error(res.data.message));
      }
    } catch (error) {
      console.error(error);
    } finally {
      loadingStop();
    }
  }

  useEffect(() => {
    async function fetchCredentials() {
      try {
        loadingStart();
        const res = await getCredentials();
        if (res.data.status === "Success") {
          setCredentials(res.data.data);
        }
        if (res.data.status === "Error") {
          console.error(new Error(res.data.message));
        }
      } catch (error) {
        console.error(error);
        // 未登入時導回登入頁
        navigate("/");
      } finally {
        loadingStop();
      }
    }
    fetchCredentials();
  }, []);

  return (
    <Box
      maxWidth={650}
      sx={{ display: "inline-block", width: "100%" }}
    >
      <Card
        className="vault-rise vault-rise-2"
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Typography
            variant="h4"
            mb={1}
            sx={{ fontWeight: 500, fontSize: { xs: "1.875rem", sm: "2.125rem" } }}
          >
            Manage your passkeys
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            此頁面即 /.well-known/passkey-endpoints 廣告的 manage 端點
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ my: 3 }}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/passkeys/create")}
            >
              建立新的 Passkey
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                await authLogout();
                navigate("/");
              }}
            >
              Logout
            </Button>
          </Stack>
          <Typography align="left">These are your passkeys:</Typography>
          {loading ? (
            <Box
              sx={{
                height: "150px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <List className="space-y-3">
              {credentials.length === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{ py: 3 }}
                >
                  尚未建立任何 Passkey
                </Typography>
              )}
              {credentials.map((credential) => {
                return (
                  <ListItem
                    key={credential.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          const confirm = window.confirm(
                            `是否要移除 Credential Id: ${credential.credential_id}`
                          );
                          if (confirm) {
                            deleCredential(credential.credential_id);
                          }
                        }}
                      >
                        <Trash />
                      </IconButton>
                    }
                    sx={{ textAlign: "left" }}
                  >
                    <ListItemIcon>
                      <Passkeys
                        width={36}
                        height={36}
                      />
                    </ListItemIcon>
                    <ListItemText disableTypography>
                      <Typography fontWeight="bold">Passkey</Typography>
                      <Typography
                        className="break-all"
                        variant="body2"
                        sx={{ fontFamily: fonts.mono, color: "secondary.main" }}
                      >
                        {credential.credential_id}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Created: {credential.created_at}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Last used: {credential.updated_at}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
      <PasskeyEndpointsCard />
    </Box>
  );
}

export default PasskeysManagePage;
