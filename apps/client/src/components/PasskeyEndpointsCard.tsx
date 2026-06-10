import { useState, useEffect } from "react";
import { Box, Card, CardContent, Chip, Link, Stack, Typography } from "@mui/material";
import { getPasskeyEndpoints, type PasskeyEndpoints } from "../service/wellknown";
import { fonts } from "../theme";

/**
 * 展示 /.well-known/passkey-endpoints 的核心目的:
 * 網站以標準端點「廣告」自己支援 Passkey,
 * 並提供直接導向建立 (enroll) 與管理 (manage) 頁面的專屬網址。
 */
export const PasskeyEndpointsCard = () => {
  const [endpoints, setEndpoints] = useState<PasskeyEndpoints | null>(null);

  useEffect(() => {
    let mounted = true;
    getPasskeyEndpoints()
      .then((res) => {
        if (mounted) setEndpoints(res.data);
      })
      .catch(() => {
        if (mounted) setEndpoints(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!endpoints || (!endpoints.enroll && !endpoints.manage)) return null;

  return (
    <Card
      className="vault-rise vault-rise-3"
      variant="outlined"
      sx={{
        mt: 3,
        borderRadius: 3,
        textAlign: "left",
        bgcolor: "rgba(13, 21, 36, 0.75)",
        borderColor: "rgba(77, 230, 180, 0.22)"
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          mb={1}
        >
          <span className="vault-led" />
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ fontFamily: fonts.mono, fontSize: "0.95rem" }}
          >
            /.well-known/passkey-endpoints
          </Typography>
          <Chip
            label="W3C Draft"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
        >
          本站以標準端點主動「廣告」支援
          Passkey。密碼管理器與作業系統可程式化地發現以下專屬網址,使用者不必在帳號設定中翻找:
        </Typography>
        <Stack spacing={1}>
          {endpoints.enroll && (
            <Box>
              <Typography
                variant="body2"
                component="span"
                fontWeight="bold"
                color="primary.main"
                mr={1}
              >
                enroll(建立 Passkey):
              </Typography>
              <Link
                href={endpoints.enroll}
                variant="body2"
                color="secondary.main"
                className="break-all"
                sx={{ fontFamily: fonts.mono }}
              >
                {endpoints.enroll}
              </Link>
            </Box>
          )}
          {endpoints.manage && (
            <Box>
              <Typography
                variant="body2"
                component="span"
                fontWeight="bold"
                color="primary.main"
                mr={1}
              >
                manage(管理 Passkey):
              </Typography>
              <Link
                href={endpoints.manage}
                variant="body2"
                color="secondary.main"
                className="break-all"
                sx={{ fontFamily: fonts.mono }}
              >
                {endpoints.manage}
              </Link>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PasskeyEndpointsCard;
