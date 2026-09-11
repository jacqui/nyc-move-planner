import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <h2 className="font-display text-2xl mb-6">Sign in</h2>
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/scenarios",
          });
        }}
        className="flex flex-col gap-3"
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="border border-line bg-white px-3 py-2 rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="border border-line bg-white px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-route text-white px-3 py-2 rounded font-medium"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
