// Script to build compact, screenshot-friendly, zero-overlap, monochrome ER diagrams
const fs = require('fs');
const path = require('path');

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

class CompactDiagram {
    constructor(name, width = 1800, height = 1100) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.cells = [];
        this.boxes = []; // For collision checking
        this.nextId = 10;
    }

    checkOverlap(id, x, y, w, h) {
        for (const b of this.boxes) {
            // Check bounding box collision with 4px margin
            const overlap = !(x + w + 4 <= b.x || x >= b.x + b.w + 4 || y + h + 4 <= b.y || y >= b.y + b.h + 4);
            if (overlap) {
                console.warn(`⚠️ OVERLAP DETECTED between ${id} (${x},${y},${w},${h}) and ${b.id} (${b.x},${b.y},${b.w},${b.h})`);
                return true;
            }
        }
        this.boxes.push({ id, x, y, w, h });
        return false;
    }

    addEntity(label, x, y, w = 150, h = 42) {
        const id = `ent_${this.nextId++}`;
        this.checkOverlap(id, x, y, w, h);
        const style = `rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=12;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;`;
        this.cells.push(`        <mxCell id="${id}" value="&lt;b&gt;${escapeXml(label)}&lt;/b&gt;" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />
        </mxCell>`);
        return { id, x, y, w, h, label };
    }

    addAttribute(label, x, y, isPk = false, isFk = false, w = 125, h = 26) {
        const id = `att_${this.nextId++}`;
        this.checkOverlap(id, x, y, w, h);
        let val;
        let fontStyle = '0';
        let strokeWidth = '1';

        if (isPk) {
            fontStyle = '4'; // Underline
            strokeWidth = '2';
            val = `&lt;u&gt;&lt;b&gt;${escapeXml(label)}&lt;/b&gt;&lt;/u&gt;`;
        } else if (isFk) {
            fontStyle = '1';
            val = `&lt;b&gt;${escapeXml(label)}&lt;/b&gt;`;
        } else {
            val = escapeXml(label);
        }

        const style = `ellipse;whiteSpace=wrap;html=1;fontSize=10;fontStyle=${fontStyle};fillColor=#ffffff;strokeColor=#000000;strokeWidth=${strokeWidth};fontColor=#000000;`;
        this.cells.push(`        <mxCell id="${id}" value="${val}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />
        </mxCell>`);
        return { id, x, y, w, h, label, isPk, isFk };
    }

    addRelationship(label, x, y, w = 120, h = 44) {
        const id = `rel_${this.nextId++}`;
        this.checkOverlap(id, x, y, w, h);
        const style = `rhombus;whiteSpace=wrap;html=1;fontStyle=1;fontSize=10;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;`;
        this.cells.push(`        <mxCell id="${id}" value="&lt;b&gt;${escapeXml(label)}&lt;/b&gt;" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />
        </mxCell>`);
        return { id, x, y, w, h, label };
    }

    connectAttr(entityId, attrId) {
        const edgeId = `edge_${this.nextId++}`;
        const style = 'endArrow=none;html=1;rounded=0;strokeColor=#000000;strokeWidth=1;';
        this.cells.push(`        <mxCell id="${edgeId}" style="${style}" edge="1" parent="1" source="${entityId}" target="${attrId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`);
    }

    connectRel(entityId, relId, card = '') {
        const edgeId = `edge_${this.nextId++}`;
        const style = 'endArrow=none;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;';
        const val = card ? escapeXml(card) : '';
        this.cells.push(`        <mxCell id="${edgeId}" value="${val}" style="${style}" edge="1" parent="1" source="${entityId}" target="${relId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`);
    }

    addHeader(title, subtitle, x = 30, y = 20) {
        const id = `title_${this.nextId++}`;
        const style = 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontColor=#000000;';
        const val = `&lt;b style=&quot;font-size:16px;&quot;&gt;${escapeXml(title)}&lt;/b&gt; &lt;span style=&quot;font-size:11px;color:#444444;margin-left:15px;&quot;&gt;${escapeXml(subtitle)}&lt;/span&gt;`;
        this.cells.push(`        <mxCell id="${id}" value="${val}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="1050" height="30" as="geometry" />
        </mxCell>`);
    }

    addLegend(x, y) {
        const boxId = `legend_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${boxId}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1;" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="420" height="36" as="geometry" />
        </mxCell>`);

        const entId = `leg_e_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${entId}" value="Entity" style="rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=9;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;" vertex="1" parent="1">
          <mxGeometry x="${x + 8}" y="${y + 7}" width="50" height="22" as="geometry" />
        </mxCell>`);

        const relId = `leg_r_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${relId}" value="Rel" style="rhombus;whiteSpace=wrap;html=1;fontStyle=1;fontSize=9;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.2;" vertex="1" parent="1">
          <mxGeometry x="${x + 66}" y="${y + 5}" width="55" height="26" as="geometry" />
        </mxCell>`);

        const pkId = `leg_pk_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${pkId}" value="&lt;u&gt;&lt;b&gt;col (PK)&lt;/b&gt;&lt;/u&gt;" style="ellipse;whiteSpace=wrap;html=1;fontSize=9;fontStyle=4;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;" vertex="1" parent="1">
          <mxGeometry x="${x + 128}" y="${y + 7}" width="65" height="22" as="geometry" />
        </mxCell>`);

        const fkId = `leg_fk_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${fkId}" value="&lt;b&gt;col (FK)&lt;/b&gt;" style="ellipse;whiteSpace=wrap;html=1;fontSize=9;fontStyle=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1;" vertex="1" parent="1">
          <mxGeometry x="${x + 198}" y="${y + 7}" width="65" height="22" as="geometry" />
        </mxCell>`);

        const txtId = `leg_t_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${txtId}" value="&lt;span style=&quot;font-size:9px;&quot;&gt;1=One, N=Many. Pure B&amp;W, No colors&lt;/span&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;" vertex="1" parent="1">
          <mxGeometry x="${x + 268}" y="${y + 7}" width="145" height="22" as="geometry" />
        </mxCell>`);
    }

    toString() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Antigravity" version="21.6.8" type="device">
  <diagram id="${this.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}" name="${escapeXml(this.name)}">
    <mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${this.width}" pageHeight="${this.height}" background="#ffffff" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${this.cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
    }
}

module.exports = { CompactDiagram };
