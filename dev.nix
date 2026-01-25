{ pkgs }:
{
  # We need to add nodejs and npm to our environment
  packages = [ pkgs.nodejs ];
  # We can also add a command to run on startup
  startup = {
    command = "npm run dev";
  };
  # And we can configure the preview
  previews = [
    {
      # We can give our preview a name
      name = "web-preview";
      # We can specify the port to preview
      port = 5000;
      # And we can specify the protocol
      protocol = "http";
      # We can also specify the type of preview
      type = "browser";
    }
  ];
}