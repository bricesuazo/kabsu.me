"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function AccountPage() {
  const { theme } = useTheme();
  console.log("🚀 ~ file: page.tsx:6 ~ AccountPage ~ theme:", theme);
  return (
    <div>
      <UserProfile
        path="/account"
        routing="virtual"
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            rootBox: {
              width: "100%",
              height: "100%",
            },
            card: {
              width: "100%",
              maxWidth: "100%",
            },
          },
        }}
      />
      {/* <Card className="">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-x-2">
            <div className="flex-[3] space-y-4">
              <div className="space-y-4">
                <div className="">
                  <h3 className="text-2xl font-semibold">Account</h3>
                  <p className="text-sm text-gray-500">
                    Manage your account information.
                  </p>
                </div>
                <div className="">
                  <h6 className="text-lg font-semibold text-muted-foreground">
                    Profile
                  </h6>
                  <Separator />

                  <div className="mt-2 flex items-center gap-x-4">
                    <Image
                      src={user.imageUrl}
                      alt=""
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                    <div className="w-full">
                      <p className="w-full text-lg font-semibold">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="w-full text-sm text-gray-500">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="">
                  <h6 className="text-lg font-semibold text-muted-foreground">
                    Contact Information
                  </h6>
                  <Separator />

                  <div className="mt-2 ">
                    <h5>
                      <span className="text-sm">
                        Primary Email Address:{" "}
                        {
                          user.emailAddresses.find(
                            (e) => e.id === user.primaryEmailAddressId,
                          )?.emailAddress
                        }
                      </span>
                    </h5>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="">
                  <h3 className="text-2xl font-semibold">Security</h3>
                  <p className="text-sm text-gray-500">
                    Manage your security preferences.
                  </p>
                </div>

                <div className="">
                  <h6 className="text-lg font-semibold text-muted-foreground">
                    Active Devices
                  </h6>
                  <Separator />

                  <div className=""></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
