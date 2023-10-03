import fs from 'fs/promises'
import handlebars from 'handlebars'
import puppeteer from 'puppeteer'
import { parseString } from 'xml2js'

async function loadpartials(){
    try{
        const header=await fs.readFile('header.hbs', 'utf-8')

        //Register partial
        handlebars.registerPartial('header', header)
    } catch(error){
        console.error('Can not load partials')
    }
}

async function convertXmlToPdf(){
    try{

        //Read XML data
        const data=await fs.readFile('task.xml', 'utf-8')
        async function parseXml(data){
            return new Promise((resolve, reject)=>{
                parseString(data, (error, result)=>{
                    if(error){
                        reject(error)
                    } else {
                        resolve(result)
                    }
                })
            })
        }

        // Parse XML data to create JS object
        const jsObject= await parseXml(data)
        
        //Load Partials
        await loadpartials()

        // Read Handlebar Template
        const template=await fs.readFile('task.hbs', 'utf-8')

        console.log(jsObject)

        // Compile template
        const compiledTemplate= handlebars.compile(template)

        // Define input context
        const inputs={
            title: 'Movies and Series',
            header: 'Popular Movies and Series',
            footer: 'This is the footer',
            movies: jsObject.binge.movies[0].movie,
            series: jsObject.binge.series[0].serie

        }
        
        //Generate HTML content
        const html=compiledTemplate(inputs)

        //Launch Puppeteer
        const browser= await puppeteer.launch()
        const page= await browser.newPage()

        // Set HTML content of the page
        await page.setContent(html)

        //Generate PDF
        await page.pdf({path: 'output.pdf', format: 'A4'})

        //Close the browser
        await browser.close()

    } catch(error){
        console.error('Error', error)
    }

}
convertXmlToPdf()