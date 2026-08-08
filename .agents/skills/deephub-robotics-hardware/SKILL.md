---
name: deephub-robotics-hardware
description: Curates and extends the physical robotics, STEM competition kits, and AI hardware directory in DeepHub AI Circuitbrain (/circuitbrain). Activate when adding educational robots, supplier purchasing links, hardware specifications, or AI purchasing advisory features.
---

# DeepHub AI Circuitbrain & Robotics Hardware Guide

This skill governs the physical hardware and educational robotics directory on [`/circuitbrain`](file:///home/ospoks/DeepHubAI-main/src/pages/Circuitbrain.tsx).

## 1. Robot Categorization Matrix
All educational robotics platforms are grouped into five core categories:

1. **AI & Humanoids**:
   - Platforms: UBTECH Yanshee, SoftBank NAO V6, Tesla Optimus, Boston Dynamics Atlas.
   - Target Audience: University & High School AI labs, computer vision, humanoid gait kinematics.
2. **Autonomous Ground AI**:
   - Platforms: DJI RoboMaster S1, Makeblock mBot2.
   - Capabilities: Mecanum omnidirectional drive, line following, target recognition, Scratch 3.0 and Python SDK.
3. **STEM Competition Kits**:
   - Platforms: LEGO Education SPIKE Prime, VEX Robotics.
   - Purpose: FIRST LEGO League (FLL), WRO competitions, mechanical gearboxes, sensors.
4. **K-5 & Early Childhood**:
   - Platforms: Matatalab TaleBot Pro, Wonder Workshop Dash, Ozobot Evo, Sphero BOLT.
   - Highlights: Screenless coding, color-coded optical sensors, block-based visual coding.
5. **DIY & Maker Robotics**:
   - Platforms: OTTO DIY Programmable Robot.
   - Highlights: 3D printed chassis, open-source Arduino / ESP32 firmware, obstacle avoidance.

## 2. Hardware Specification Schema
Each entry in `TEACHER_ROBOTS` must provide:
- `name`: Official commercial model name.
- `price`: Estimated Indian Rupee (₹) price quote.
- `manufacturer`: Hardware brand / engineering company.
- `description`: 2-sentence pedagogical and technical summary.
- `category`: Exactly matching `RobotCollectionCategory`.
- `image`: High-resolution asset imported from `src/assets/robots/`.
- `fallbackImage`: Unsplash / CDN high-uptime image fallback.
- `officialWebsite`: Direct link to the manufacturer's technical spec sheet.
- `gradeLevel`: Target student age/class bracket.
- `codingLanguage`: Supported development environments (e.g. Scratch, Python, C++, ROS2).
- `suppliers`: Array of authorized distributors with live purchasing links (Amazon India, Robocraze, Official Stores).
