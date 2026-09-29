  export const getUserInitials = (name:string | undefined) => {
   const  userName = name || "";
    const initials = userName
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
    return initials;
  };

export const clx = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");