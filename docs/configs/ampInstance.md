---
title: AMP Instance
description: AMP Configuration
---

The AMP connection is configured in the `ampInstance.yaml` file.

```yaml
url: https://amp.host.or.ip:8080
username: amp-username
password: amp-password
```

## Services

Once the AMP connection is configured, individual instances can be configured to pull statistics of gameservers. Only CPU, Memory and Player count are currently supported.

### Configuration Options

- `ampInstanceId`: The instance id of the AMP server

#### Examples

```yaml
- Minecraft:
  icon: minecraft.png
  description: Minecraft Server
  ampInstanceId: xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx
```

## AMP Instance Id

1. Navigate to the Main AMP Instance portal, click on File Manager
2. Click on the folder with the name of your gameserver, like Minecraft01
3. Then open the AMPconfig.conf
4. Search for AMP.InstanceID

