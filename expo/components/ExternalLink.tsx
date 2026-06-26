import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps } from 'react';

export function ExternalLink(props: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  return (
    <Link
      {...props}
      href={props.href}
      onPress={(e) => {
        e.preventDefault();
        WebBrowser.openBrowserAsync(props.href as string);
      }}
    />
  );
}
