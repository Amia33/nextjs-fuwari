import Image from "next/image";

import { profileConfig } from "@/src/config/profile";

import { WidgetLayout } from "./WidgetLayout";

export function ProfileWidget() {
  return (
    <WidgetLayout>
      <div className="flex items-center gap-3">
        <Image
          src={profileConfig.avatar}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-full bg-base-200 object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-medium">{profileConfig.name}</p>
          <p className="truncate text-xs text-subtle">{profileConfig.bio}</p>
        </div>
      </div>
    </WidgetLayout>
  );
}
