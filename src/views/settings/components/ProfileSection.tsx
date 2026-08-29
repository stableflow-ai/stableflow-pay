import { type FormEvent } from "react";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { Card } from "@/components/ui/card/Card";
import {
  LOGO_URL_MAX_LENGTH,
  ORGANIZATION_NAME_MAX_LENGTH,
  ORGANIZATION_SLUG_MAX_LENGTH,
} from "../config";

const FIELD_CLASS =
  "mt-2.5 h-10 w-full rounded-[6px] border border-[#e3e3e3] bg-[#f6f6f6] px-3 font-montserrat text-sm font-medium text-black outline-none placeholder:text-black/30";

export function ProfileSection(props: {
  name: string;
  slug: string;
  logo: string;
  saving: boolean;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onLogoChange: (value: string) => void;
  onSave: (event: FormEvent) => void;
}) {
  const { name, slug, logo, saving, onNameChange, onSlugChange, onLogoChange, onSave } = props;

  return (
    <Card className="flex flex-col gap-6 px-6 py-6 md:px-7 md:py-6">
      <div>
        <h2 className="font-montserrat text-xl font-medium capitalize text-black">Profile</h2>
        <p className="mt-2 font-montserrat text-sm font-normal text-[#909090]">
          Update how your organization appears in Pay.Stableflow
        </p>
      </div>
      <form className="flex flex-col gap-5" onSubmit={onSave}>
        <div>
          <label htmlFor="organization-name" className="font-montserrat text-sm font-medium text-[#606060]">
            Organization Name
          </label>
          <input
            id="organization-name"
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Your organization name"
            maxLength={ORGANIZATION_NAME_MAX_LENGTH}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="organization-slug" className="font-montserrat text-sm font-medium text-[#606060]">
            Slug
          </label>
          <input
            id="organization-slug"
            type="text"
            value={slug}
            onChange={(event) => onSlugChange(event.target.value)}
            placeholder="Your organization slug"
            maxLength={ORGANIZATION_SLUG_MAX_LENGTH}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="logo-url" className="font-montserrat text-sm font-medium text-[#606060]">
            Logo URL
          </label>
          <input
            id="logo-url"
            type="text"
            value={logo}
            onChange={(event) => onLogoChange(event.target.value)}
            placeholder="Your organization logo url"
            maxLength={LOGO_URL_MAX_LENGTH}
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            size={BUTTON_SIZE.Md}
            loading={saving}
            className="h-10 w-full rounded-[8px] text-sm md:w-[150px]"
          >
            Save Change
          </Button>
        </div>
      </form>
    </Card>
  );
}
