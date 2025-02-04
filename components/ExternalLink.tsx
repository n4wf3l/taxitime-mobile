import { Link } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { ComponentProps } from "react";
import { Platform } from "react-native";

// ✅ Correction ici : Typage précis pour href
type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: `https://${string}` | `http://${string}`;
};

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== "web") {
          event.preventDefault();
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
