import { Outlet } from "react-router-dom";
import { Box, Chip, Container, CssBaseline, Stack, Typography } from "@mui/material";
import { Passkeys } from "./utils";

interface Props {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <>
      <CssBaseline />
      <div className="size-full vault-bg">
        <Container
          className="absolute position-center overflow-y-auto"
          sx={{ textAlign: "center", py: { xs: 4, sm: 0 }, position: "relative", zIndex: 1 }}
        >
          <Stack
            className="vault-rise"
            direction="row"
            spacing={1.5}
            justifyContent="center"
            alignItems="center"
            mb={1}
          >
            <Box
              sx={{
                display: "inline-flex",
                p: 1,
                borderRadius: "14px",
                border: "1px solid rgba(77, 230, 180, 0.35)",
                bgcolor: "rgba(77, 230, 180, 0.08)",
                boxShadow: "0 0 1.5rem rgba(77, 230, 180, 0.18)",
                color: "primary.main"
              }}
            >
              <Passkeys
                width={34}
                height={34}
              />
            </Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ fontSize: { xs: "2.25rem", sm: "3rem" } }}
            >
              Passless
            </Typography>
          </Stack>
          <Stack
            className="vault-rise vault-rise-1"
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            mb={3}
          >
            <Typography
              variant="subtitle1"
              color="text.secondary"
            >
              A demo of the WebAuthn specification
            </Typography>
            <Chip
              label="passkeys ready"
              size="small"
              variant="outlined"
              color="primary"
              icon={
                <span
                  className="vault-led"
                  style={{ marginLeft: 8 }}
                />
              }
            />
          </Stack>
          {(children && children) || <Outlet />}
        </Container>
      </div>
    </>
  );
}
