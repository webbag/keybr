import { Header } from "@keybr/widget";
import { FormattedMessage } from "react-intl";

export function AccountName() {
  return (
    <Header level={1}>
      <FormattedMessage id="t_Account" defaultMessage="Account" />
    </Header>
  );
}
